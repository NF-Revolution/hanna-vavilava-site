/*
 * The Publish button's backend (E2.6). The site reads the database only at
 * build time (E2.2), so a saved edit reaches visitors when this rebuilds it:
 * stamp the "stan stajni" date, then ask GitHub to run `deploy.yml`.
 *
 * Deployed by hand, like the rules:
 *
 *   npx firebase-tools@15 functions:secrets:set PUBLISH_TOKEN --project hanna-vavilava-site
 *   npx firebase-tools@15 functions:secrets:set CLOUDFLARE_TOKEN --project hanna-vavilava-site
 *   npx firebase-tools@15 functions:secrets:set R2_ACCESS_KEY_ID --project hanna-vavilava-site
 *   npx firebase-tools@15 functions:secrets:set R2_SECRET_ACCESS_KEY --project hanna-vavilava-site
 *   npx firebase-tools@15 deploy --only functions --project hanna-vavilava-site
 *
 * The panel writes X-ray PDFs to R2 from the browser (E2.10), so the bucket needs
 * the CORS rules in `r2.cors.json`, applied by hand as well:
 *
 *   npx wrangler@4 r2 bucket cors set hanna-vavilava-media --file r2.cors.json
 *
 * ponytail: production and localhost only — a preview channel's panel cannot
 * upload. #63 adds the real origin.
 */
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { randomBytes } from 'node:crypto';
import { presign } from './presign.js';
import { soldXrays } from './sold.js';

initializeApp({
  databaseURL: 'https://hanna-vavilava-site-default-rtdb.europe-west1.firebasedatabase.app',
});

/*
 * A fine-grained personal access token: this repository only, Contents read
 * and write, which is what repository_dispatch needs.
 * ponytail: a PAT expires and Publish then fails with GitHub's 401; a GitHub
 * App installation token is the upgrade if renewing it becomes a chore.
 */
const token = defineSecret('PUBLISH_TOKEN');

/*
 * A Cloudflare API token with Account · Workers R2 Storage · Edit and
 * Zone · Cache Purge on nfrevolution.com (E2.8).
 * ponytail: the ids and the base mirror `src/media.ts`, because `functions/`
 * deploys on its own and cannot import `src/`. #63 changes the zone and the base.
 */
const cloudflare = defineSecret('CLOUDFLARE_TOKEN');
const r2 = {
  account: '7966a3f105555a5b47fec8bf7d0d4bfb',
  zone: '7316aefb061602d151fafa6889e201b3',
  bucket: 'hanna-vavilava-media',
  base: 'https://hv-media.nfrevolution.com',
  cacheControl: 'public, max-age=31536000, immutable',
};

/*
 * The S3 pair of an R2 API token scoped to `hanna-vavilava-media`, Object Read &
 * Write (E2.10). `CLOUDFLARE_TOKEN` is a REST bearer token and cannot sign S3.
 */
const r2KeyId = defineSecret('R2_ACCESS_KEY_ID');
const r2Secret = defineSecret('R2_SECRET_ACCESS_KEY');

/* Mirrors `xrayMaxBytes` in `src/media.ts`. */
const xrayMaxBytes = 100 * 1024 * 1024;
// Only X-ray PDFs, so the delete below can never reach a video.
const xrayKey = /^horses\/[a-z0-9]+(-[a-z0-9]+)*\/xrays\/[\w-]+\.pdf$/;

const adminOnly = (request) => {
  // onCall has already verified the ID token; the claim is ours to check, before any write.
  if (request.auth?.token.admin !== true) throw new HttpsError('permission-denied', 'admin only');
};

/*
 * A sold horse's X-rays are someone else's health record now (#4, #23). Delete
 * the objects, purge them from the edge — every object is cached `immutable`
 * for a year, so a delete alone keeps serving the copy (#69) — and only then
 * drop the keys from the database. A failure throws before the database is
 * touched, so the next Publish retries the lot; a 404 on delete is done.
 */
async function deleteXrays(keys) {
  const api = (path, init) =>
    fetch(`https://api.cloudflare.com/client/v4${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${cloudflare.value()}`, ...init.headers },
    });
  for (const key of keys) {
    // The endpoint `wrangler r2 object delete` calls, key unescaped as it sends it; horseSchema's
    // key pattern allows nothing a URL path would need to escape.
    const res = await api(`/accounts/${r2.account}/r2/buckets/${r2.bucket}/objects/${key}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 404)
      throw new HttpsError('internal', `R2 answered ${res.status}`);
  }
  // Batches of 30, inside the per-call URL limit of every Cloudflare plan.
  const urls = keys.map((key) => `${r2.base}/${key}`);
  for (let i = 0; i < urls.length; i += 30) {
    const purge = await api(`/zones/${r2.zone}/purge_cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: urls.slice(i, i + 30) }),
    });
    if (!purge.ok) throw new HttpsError('internal', `Cloudflare purge answered ${purge.status}`);
  }
}

async function deleteSoldXrays(db) {
  const files = soldXrays((await db.ref('horses').get()).val());
  if (files.length === 0) return;
  await deleteXrays(files.map(({ key }) => key));
  await db
    .ref()
    .update(Object.fromEntries(files.map(({ slug }) => [`horses/${slug}/xrays/files`, null])));
}

/*
 * An X-ray PDF upload (E2.10): a presigned PUT, so the browser never holds an R2
 * credential and 100 MB never passes through a Function. The key is built here and
 * is never reused — the object is cached `immutable` for a year. The download name
 * is the horse and the exam date, never the uploaded file's name, which is where an
 * owner's surname tends to sit (#3).
 */
export const xrayUpload = onCall(
  { region: 'europe-central2', secrets: [r2KeyId, r2Secret] },
  (request) => {
    adminOnly(request);
    const { slug, takenOn, bytes } = request.data ?? {};
    if (
      !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(takenOn) ||
      !Number.isInteger(bytes) ||
      bytes < 1
    )
      throw new HttpsError('invalid-argument', 'slug, takenOn and bytes');
    if (bytes > xrayMaxBytes) throw new HttpsError('invalid-argument', 'over 100 MB');

    const key = `horses/${slug}/xrays/${takenOn}-${randomBytes(4).toString('hex')}.pdf`;
    const headers = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${slug}-xray-${takenOn}.pdf"`,
      'Cache-Control': r2.cacheControl,
    };
    const url = presign({
      method: 'PUT',
      host: `${r2.account}.r2.cloudflarestorage.com`,
      path: `${r2.bucket}/${key}`,
      region: 'auto',
      accessKeyId: r2KeyId.value(),
      secretAccessKey: r2Secret.value(),
      expires: 900,
      headers,
    });
    return { key, url, headers };
  },
);

/* Removed in the editor: gone from R2 and from the edge before the record drops the key. */
export const xrayDelete = onCall(
  { region: 'europe-central2', secrets: [cloudflare] },
  async (request) => {
    adminOnly(request);
    const keys = request.data?.keys;
    if (!Array.isArray(keys) || keys.length === 0 || !keys.every((k) => xrayKey.test(k)))
      throw new HttpsError('invalid-argument', 'X-ray keys only');
    await deleteXrays(keys);
  },
);

export const publish = onCall(
  { region: 'europe-central2', secrets: [token, cloudflare] },
  async (request) => {
    adminOnly(request);

    // Before the build, so the page it renders and the edge already agree.
    await deleteSoldXrays(getDatabase());

    // en-CA formats a date as YYYY-MM-DD, the shape the build's siteSchema parses.
    const updated = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format();
    await getDatabase().ref('site/updated').set(updated);

    const at = Date.now();
    const res = await fetch(
      'https://api.github.com/repos/NF-Revolution/hanna-vavilava-site/dispatches',
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token.value()}`,
          'User-Agent': 'hanna-vavilava-site',
        },
        body: JSON.stringify({ event_type: 'publish' }),
      },
    );
    if (!res.ok) throw new HttpsError('internal', `GitHub answered ${res.status}`);
    // The panel matches the deploy run by this time, so it is the server's clock, not the browser's.
    return { updated, at };
  },
);
