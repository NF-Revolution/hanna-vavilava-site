/*
 * The Publish button's backend (E2.6). The site reads the database only at
 * build time (E2.2), so a saved edit reaches visitors when this rebuilds it:
 * stamp the "stan stajni" date, then ask GitHub to run `deploy.yml`.
 *
 * Deployed by hand, like the rules:
 *
 *   npx firebase-tools@15 functions:secrets:set PUBLISH_TOKEN --project hanna-vavilava-site
 *   npx firebase-tools@15 functions:secrets:set CLOUDFLARE_TOKEN --project hanna-vavilava-site
 *   npx firebase-tools@15 deploy --only functions --project hanna-vavilava-site
 */
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
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
};

/*
 * A sold horse's X-rays are someone else's health record now (#4, #23). Delete
 * the objects, purge them from the edge — every object is cached `immutable`
 * for a year, so a delete alone keeps serving the copy (#69) — and only then
 * drop the keys from the database. A failure throws before the database is
 * touched, so the next Publish retries the lot; a 404 on delete is done.
 */
async function deleteSoldXrays(db) {
  const files = soldXrays((await db.ref('horses').get()).val());
  if (files.length === 0) return;

  const api = (path, init) =>
    fetch(`https://api.cloudflare.com/client/v4${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${cloudflare.value()}`, ...init.headers },
    });
  for (const { key } of files) {
    // The endpoint `wrangler r2 object delete` calls, key unescaped as it sends it; horseSchema's
    // key pattern allows nothing a URL path would need to escape.
    const res = await api(`/accounts/${r2.account}/r2/buckets/${r2.bucket}/objects/${key}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 404)
      throw new HttpsError('internal', `R2 answered ${res.status}`);
  }
  // Batches of 30, inside the per-call URL limit of every Cloudflare plan.
  const urls = files.map(({ key }) => `${r2.base}/${key}`);
  for (let i = 0; i < urls.length; i += 30) {
    const purge = await api(`/zones/${r2.zone}/purge_cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: urls.slice(i, i + 30) }),
    });
    if (!purge.ok) throw new HttpsError('internal', `Cloudflare purge answered ${purge.status}`);
  }

  await db
    .ref()
    .update(Object.fromEntries(files.map(({ slug }) => [`horses/${slug}/xrays/files`, null])));
}

export const publish = onCall(
  { region: 'europe-central2', secrets: [token, cloudflare] },
  async (request) => {
    // onCall has already verified the ID token; the claim is ours to check, before any write.
    if (request.auth?.token.admin !== true) throw new HttpsError('permission-denied', 'admin only');

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
