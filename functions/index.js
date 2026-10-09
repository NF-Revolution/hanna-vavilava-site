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
 *   npx firebase-tools@15 functions:secrets:set RESEND_API_KEY --project hanna-vavilava-site
 *   npx firebase-tools@15 deploy --only functions --project hanna-vavilava-site
 *
 * `startsWeekly` (E2.12) is a scheduled Function, so the first deploy of it asks to
 * enable the Cloud Scheduler API. It needs no secret of its own.
 *
 * `submitEnquiry` (E5.3) sits behind the Hosting rewrite `/api/enquiry`, and a
 * hosting deploy fails while the rewrite points at a Function that does not exist.
 * Deploy it before any hosting deploy that carries the rewrite:
 *
 *   npx firebase-tools@15 deploy --only functions:submitEnquiry --project hanna-vavilava-site
 *
 * It tells Hanna on Telegram (#43), and deploys only once both secrets exist. Make a bot
 * with @BotFather, which gives the token. Have Hanna (or a group she is in) send the bot
 * a message, then read the chat id from https://api.telegram.org/bot<token>/getUpdates:
 *
 *   npx firebase-tools@15 functions:secrets:set TELEGRAM_TOKEN --project hanna-vavilava-site
 *   npx firebase-tools@15 functions:secrets:set TELEGRAM_CHAT --project hanna-vavilava-site
 *
 * Since E5.6 it also needs the Turnstile widget's secret, and it goes out only after
 * the hosting deploy that carries the widget's real `turnstileSitekey` (`src/site.ts`).
 * Until then no form sends a valid token, and every real enquiry would be refused. The old Function drops the unknown token field, so hosting can go first.
 *
 *   npx firebase-tools@15 functions:secrets:set TURNSTILE_SECRET --project hanna-vavilava-site
 *
 * Since E5.10 (#49) it also needs `PROBE_TOKEN`, which `enquiryProbe` shares, so set it
 * before either one deploys. Any long random string will do (`openssl rand -hex 32`):
 *
 *   npx firebase-tools@15 functions:secrets:set PROBE_TOKEN --project hanna-vavilava-site
 *
 * `newHorses` (E5.9, #48) sits behind the `/api/notify` rewrites, so it deploys before
 * the hosting that carries them, with the database rules for its email index. It needs
 * `ANNOUNCE_TOKEN`, another long random string, set to the same value as the GitHub
 * Actions secret of that name: `deploy.yml` sends it to announce new horses. Its
 * `retention` is the third Cloud Scheduler job, still inside the free three.
 *
 *   npx firebase-tools@15 functions:secrets:set ANNOUNCE_TOKEN --project hanna-vavilava-site
 *   gh secret set ANNOUNCE_TOKEN --repo NF-Revolution/hanna-vavilava-site
 *   npx firebase-tools@15 deploy --only database,functions:newHorses,functions:retention \
 *     --project hanna-vavilava-site
 *
 * `retention` was `subscribersCleanup` until E7.7 (#142) gave it the enquiries too. Its
 * first deploy leaves the old job running, so delete that one once, by hand:
 *
 *   npx firebase-tools@15 functions:delete subscribersCleanup --region europe-central2 \
 *     --project hanna-vavilava-site
 *
 * The error policy now names `retention`, so re-apply it over the live one. <POLICY> is
 * the `name` that `gcloud monitoring policies list --project hanna-vavilava-site` prints:
 *
 *   gcloud monitoring policies update <POLICY> --project hanna-vavilava-site \
 *     --policy-from-file monitoring/errors.policy.json
 *
 * Cloud Monitoring watches both of them, and it mails the developer, never Hanna. It
 * needs one email channel, an uptime check (a 405 on GET counts as up), and the two
 * policies in `monitoring/`. <CHANNEL> is the `name` that the first command prints:
 *
 *   gcloud beta monitoring channels create --project hanna-vavilava-site --type email \
 *     --display-name Developer --channel-labels email_address=<developer email>
 *   gcloud monitoring uptime create "Enquiry endpoint" --project hanna-vavilava-site \
 *     --resource-type uptime-url \
 *     --resource-labels host=hanna-vavilava-site.web.app,project_id=hanna-vavilava-site \
 *     --protocol https --path /api/enquiry --status-codes 405 --period 15
 *   gcloud monitoring policies create --project hanna-vavilava-site \
 *     --policy-from-file monitoring/uptime.policy.json --notification-channels <CHANNEL>
 *   gcloud monitoring policies create --project hanna-vavilava-site \
 *     --policy-from-file monitoring/errors.policy.json --notification-channels <CHANNEL>
 *
 * To check it, run the probe once. `/monitor/enquiry` should get a new `createdAt`,
 * and no mail should arrive:
 *
 *   gcloud scheduler jobs run firebase-schedule-enquiryProbe-europe-central2 \
 *     --location europe-central2 --project hanna-vavilava-site
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
import { getDatabase, ServerValue } from 'firebase-admin/database';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { enquiryEmail, expired, failedPath, parseEnquiry, sentPath } from './enquiry.js';
import { telegramMessage } from './notify.js';
import {
  announceEmail,
  confirmEmail,
  confirmWindow,
  from,
  oneClickUrl,
  parseSignup,
  paths,
  replyTo,
  toAnnounce,
} from './subscribe.js';
import { presign } from './presign.js';
import { soldXrays } from './sold.js';
import { apiKey, fetchStarts, startFacts } from './starts.js';

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

/*
 * What Publish does, and what the Monday sync does after a change. The sold X-rays
 * go before the build, so the page it renders and the edge already agree.
 */
async function release() {
  await deleteSoldXrays(getDatabase());

  // en-CA formats a date as YYYY-MM-DD, the shape the build's siteSchema parses.
  const updated = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format();
  await getDatabase().ref('site/updated').set(updated);

  return { updated, at: await dispatch('publish') };
}

/*
 * Starts a workflow: `publish` runs `deploy.yml`, `preview` runs `draft.yml`. Returns the
 * time just before the dispatch. The panel finds the run by it, so the time comes from the
 * server's clock, not the browser's.
 */
async function dispatch(event_type) {
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
      body: JSON.stringify({ event_type }),
    },
  );
  if (!res.ok) throw new HttpsError('internal', `GitHub answered ${res.status}`);
  return at;
}

export const publish = onCall(
  { region: 'europe-central2', secrets: [token, cloudflare] },
  async (request) => {
    adminOnly(request);
    return release();
  },
);

/*
 * Preview (E2.15): `draft.yml` builds the saved database to the `draft` channel. Only the
 * dispatch. It does not stamp `/site/updated` and does not delete sold X-rays: that delete
 * cannot be undone, and both belong to Publish. Deploy it by hand once:
 *
 *   npx firebase-tools@15 deploy --only functions:preview --project hanna-vavilava-site
 */
export const preview = onCall({ region: 'europe-central2', secrets: [token] }, async (request) => {
  adminOnly(request);
  return { at: await dispatch('preview') };
});

/*
 * Starts from livejumping (E2.12), for every horse not sold. Only the sync writes
 * these two facts. No `livejumpingName`, no matching rows, or no finished round
 * leaves the fact `null`, which the page shows as "on request". A horse livejumping
 * fails on keeps its stored facts and does not stop the others; a missing key
 * throws for the whole run. Only a fact whose text changed is written.
 *
 * ponytail: a misspelt name reads as "no starts" and shows "on request"; the panel's
 * change list is where Hanna sees it. A panel Save of a horse left open across the
 * Monday run writes the old facts back, and the next run puts them right.
 */
async function syncStarts() {
  const db = getDatabase();
  const horses = (await db.ref('horses').get()).val() ?? {};
  const unsold = Object.entries(horses).filter(([, horse]) => horse && horse.status !== 'sold');
  const changes = [];
  const errors = [];

  // Before any write, so a missing key changes nothing.
  const key = unsold.some(([, horse]) => horse.livejumpingName) ? await apiKey() : undefined;
  for (const [slug, horse] of unsold) {
    const name = horse.name ?? slug;
    try {
      let facts = { starts: null, lastStart: null };
      if (horse.livejumpingName) {
        const starts = await fetchStarts(key, horse.livejumpingName, horse.born);
        if (starts.length) facts = startFacts(starts);
      }
      const write = {};
      for (const field of ['starts', 'lastStart']) {
        const to = facts[field];
        const from = horse.facts?.[field] ?? null;
        if (to?.pl === from?.pl && to?.en === from?.en) continue;
        write[`horses/${slug}/facts/${field}`] = to;
        changes.push({ name, field, from: from?.pl ?? '', to: to?.pl ?? '' });
      }
      if (Object.keys(write).length) await db.ref().update(write);
    } catch (e) {
      errors.push({ name, message: e.message });
    }
  }
  return { changes, errors };
}

/* The panel's "Refresh starts". Hanna reads what changed, then publishes as usual. */
export const refreshStarts = onCall(
  { region: 'europe-central2', timeoutSeconds: 300 },
  async (request) => {
    adminOnly(request);
    try {
      return await syncStarts();
    } catch (e) {
      throw new HttpsError('unavailable', e.message);
    }
  },
);

/* Monday 06:00 in Warsaw, so the weekend's shows are live before the week's first enquiries. */
export const startsWeekly = onSchedule(
  {
    schedule: '0 6 * * 1',
    timeZone: 'Europe/Warsaw',
    region: 'europe-central2',
    secrets: [token, cloudflare],
    timeoutSeconds: 300,
  },
  async () => {
    const { changes, errors } = await syncStarts();
    for (const { name, message } of errors) logger.error(`starts: ${name}: ${message}`);
    logger.info(`starts: ${changes.length} change(s)`, { changes });
    if (changes.length) await release();
  },
);

/*
 * The enquiry form's endpoint (E5.3): a plain form POST, answered with a 303 to the
 * sent page, so the no-JavaScript path is the only path. Every refusal and failure is
 * a 303 to the failure page instead (E5.7), which offers WhatsApp: a buyer never sees
 * success for a send that did not happen, nor a bare error body. The sent page's
 * fragment carries the stored number back, so a typo shows; a fragment reaches no
 * server log and no referrer. The record goes under
 * `/enquiries` in the inbox's contract (E2.7): `push()`, `createdAt` in ms, and
 * never `handled`, which only the panel sets.
 *
 * A bot that fills the honeypot or posts within 3 s of the page loading gets the
 * same 303 and writes nothing, so it learns nothing. `elapsed` is set by an inline
 * script on submit; without JavaScript it is absent and the trap is skipped.
 *
 * Nothing is written without a Turnstile token that Cloudflare's siteverify accepts
 * (E5.6), so the direct function URL cannot skip it, and no JavaScript means no
 * token: the form's `<noscript>` line sends that buyer to WhatsApp.
 *
 * Two in-memory limits on the one instance `maxInstances` allows. Per address: 5
 * posts an hour, which a caller of the direct URL escapes by forging the forwarded
 * IP. Overall: 20 verified posts an hour, whatever address they claim, which is what
 * keeps Hanna's phone quiet. It counts only posts that passed Turnstile, so junk
 * cannot use it up and lock real buyers out.
 * ponytail: a cold start resets both, after ~15 idle minutes, so a patient flood gets
 * a few times 20 an hour, each post with a solved token. A counter in the database is
 * the upgrade if that is not enough. No IP is ever stored.
 *
 * The daily probe (#49) posts with `X-Probe`, the `PROBE_TOKEN` secret. It runs the
 * same path, skips only the Turnstile verdict and the overall limit, and its sinks go
 * where nobody reads them: `/monitor/enquiry`, Resend's test inbox, Telegram's `getChat`.
 */
const perHour = 5;
const allPerHour = 20;
const probeToken = defineSecret('PROBE_TOKEN');
const telegramToken = defineSecret('TELEGRAM_TOKEN');
const telegramChat = defineSecret('TELEGRAM_CHAT');

/*
 * One message to Hanna (#43). A failure is logged and goes no further: the enquiry is
 * already stored or emailed (#44), and a 500 would only make the buyer send it again.
 * #49 watches for this error. The probe asks `getChat` instead: the same token and chat
 * are proven, and Hanna gets nothing.
 */
async function notify(record, probe) {
  try {
    // A failed read still sends, with the slug in place of the name. A search names none.
    const horseName =
      !record.horse || record.horse === 'undecided'
        ? undefined
        : ((await getDatabase()
            .ref(`horses/${record.horse}/name`)
            .get()
            .then((s) => s.val())
            .catch(() => null)) ?? record.horse);
    const res = await fetch(
      `https://api.telegram.org/bot${telegramToken.value()}/${probe ? 'getChat' : 'sendMessage'}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChat.value(),
          ...telegramMessage(record, horseName),
        }),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) throw new Error(`Telegram answered ${res.status}: ${await res.text()}`);
  } catch (e) {
    logger.error(`enquiry telegram: ${e.message}`);
  }
}

const matches = (header, secret) => {
  const [got, want] = [header ?? '', secret].map((s) => Buffer.from(s));
  return want.length > 0 && got.length === want.length && timingSafeEqual(got, want);
};
const isProbe = (req) => matches(req.get('x-probe'), probeToken.value());

/*
 * A form posted from a Hosting channel is a test: the `draft` preview (E2.15) or a pull
 * request's. The rewrites still send it here, so it ends where the honeypot does, on the
 * sent page, with nothing stored, mailed or messaged. A channel host is always
 * `<site>--<channel>-<hash>.web.app`, and no live host contains `--`.
 * ponytail: the check reads headers a script can drop. Dropping them only lets a test
 * through and never stops a buyer. A build-time flag on the form is the upgrade.
 */
const fromChannel = (req) =>
  [req.get('origin'), req.get('x-forwarded-host')].some((host) => host?.includes('--'));
const hits = new Map();
let verified = 0;
let windowStart = Date.now();

const turnstile = defineSecret('TURNSTILE_SECRET');

/*
 * A network error or a slow Cloudflare fails closed: the buyer is told to use WhatsApp.
 * A rejected secret is logged, because it refuses every buyer in silence (#49).
 */
async function human(token) {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: turnstile.value(), response: token }),
      signal: AbortSignal.timeout(5000),
    });
    const { success, 'error-codes': codes = [] } = await res.json();
    if (codes.some((c) => c.endsWith('-input-secret')))
      logger.error(`turnstile: ${codes.join(', ')}`);
    return success === true;
  } catch (e) {
    logger.error(`turnstile: ${e.message}`);
    return false;
  }
}

/*
 * The second sink (E5.5): every enquiry also lands in the shared mailbox through
 * Resend's HTTP API, so it survives the database. A sending-only API key on the
 * `nfrevolution.com` domain, EU region; bounces use `send.nfrevolution.com`, so the
 * root SPF record takes no new lookup (#64 publishes the records).
 * ponytail: both addresses mirror `/site/email`, because `functions/` cannot import
 * `src/`. #63 changes the domain.
 */
const resendKey = defineSecret('RESEND_API_KEY');

async function resend(endpoint, body) {
  if (!resendKey.value()) throw new Error('RESEND_API_KEY is not set');
  const res = await fetch(`https://api.resend.com${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey.value()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

const sendEnquiryEmail = (record, probe) =>
  resend('/emails', {
    from: 'Formularz <formularz@nfrevolution.com>',
    // Resend's test inbox: the key and the domain are proven, the mailbox stays clean.
    to: probe ? 'delivered@resend.dev' : 'kontakt@nfrevolution.com',
    ...enquiryEmail(record),
  });

export const submitEnquiry = onRequest(
  {
    region: 'europe-central2',
    maxInstances: 1,
    secrets: [telegramToken, telegramChat, turnstile, resendKey, probeToken],
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.set('Allow', 'POST').status(405).send('POST only');
      return;
    }

    if (Date.now() - windowStart > 60 * 60 * 1000) {
      hits.clear();
      verified = 0;
      windowStart = Date.now();
    }
    // Hosting passes the visitor's address on; the first X-Forwarded-For entry is the fallback.
    const body = req.body ?? {};
    const failed = failedPath[body.locale === 'en' ? 'en' : 'pl'];
    const ip =
      req.get('fastly-client-ip') ?? req.get('x-forwarded-for')?.split(',')[0].trim() ?? req.ip;
    const count = (hits.get(ip) ?? 0) + 1;
    hits.set(ip, count);
    if (count > perHour) {
      res.redirect(303, failed);
      return;
    }

    if (body.website || (body.elapsed && Number(body.elapsed) < 3000) || fromChannel(req)) {
      res.redirect(303, sentPath[body.locale === 'en' ? 'en' : 'pl']);
      return;
    }

    const record = parseEnquiry(body);
    if (!record) {
      res.redirect(303, failed);
      return;
    }
    const probe = isProbe(req);
    // The probe's token always fails, but the call still proves the secret.
    const token = body['cf-turnstile-response'];
    const passed = typeof token === 'string' && token && (await human(token));
    if (!passed && !probe) {
      res.redirect(303, failed);
      return;
    }
    if (!probe && ++verified > allPerHour) {
      res.redirect(303, failed);
      return;
    }
    // Independent sinks: the enquiry is delivered if any one of them took it.
    const entry = { ...record, createdAt: ServerValue.TIMESTAMP };
    const results = await Promise.allSettled([
      probe
        ? getDatabase().ref('monitor/enquiry').set(entry)
        : getDatabase().ref('enquiries').push(entry),
      sendEnquiryEmail(record, probe),
    ]);
    ['db', 'email'].forEach((sink, i) => {
      if (results[i].status === 'rejected')
        logger.error(`enquiry: ${sink}: ${results[i].reason?.message}`);
    });
    if (results.every((r) => r.status === 'rejected')) {
      res.redirect(303, failed);
      return;
    }
    // Awaited: a v2 Function loses its CPU once it has answered.
    await notify(record, probe);
    res.redirect(303, `${sentPath[record.locale]}#${record.whatsapp}`);
  },
);

/*
 * The synthetic enquiry (#49): once a day, through the Hosting rewrite like a buyer's.
 * Anything but the sent page is an error: since E5.7 a refusal is a 303 too, to the
 * not-sent page, and a trap's 303 carries no `#number`. Cloud Monitoring mails every error from this
 * Function and from `submitEnquiry` (`monitoring/errors.policy.json`).
 * ponytail: the probe cannot solve a real challenge, so a sitekey or hostname mismatch
 * (E5.6) stays invisible; only a rejected secret is caught, in `human()`.
 */
export const enquiryProbe = onSchedule(
  {
    schedule: '0 7 * * *',
    timeZone: 'Europe/Warsaw',
    region: 'europe-central2',
    secrets: [probeToken],
  },
  async () => {
    try {
      const res = await fetch('https://hanna-vavilava-site.web.app/api/enquiry', {
        method: 'POST',
        redirect: 'manual',
        headers: { 'X-Probe': probeToken.value() },
        body: new URLSearchParams({
          name: 'Probe',
          country: 'Monitor',
          whatsapp: '+48000000000',
          level: 'pro',
          budget: '40plus',
          timeframe: 'browsing',
          horse: 'undecided',
          locale: 'pl',
          'cf-turnstile-response': 'probe',
        }),
        signal: AbortSignal.timeout(30_000),
      });
      const to = res.headers.get('location') ?? '';
      if (res.status !== 303 || !to.startsWith(`${sentPath.pl}#`))
        throw new Error(`answered ${res.status} ${to}`);
    } catch (e) {
      logger.error(`probe: /api/enquiry ${e.message}`);
    }
  },
);

/*
 * The new-horse list (E5.9, #48), behind the Hosting rewrites `/api/notify` and
 * `/api/notify/**`. Every answer to a form is a 303, as the enquiry's is.
 *
 * Signup: the honeypot and Turnstile as on the enquiry, and the same two in-memory
 * limits on their own counters, so signups never use up the enquiries' budget. A
 * bot that signs up a stranger costs that stranger one confirmation mail at most:
 * nothing more goes out without the click, and an unconfirmed address is deleted
 * after 7 days. An address already on the list gets the same "check your inbox"
 * answer and no mail, so the form never tells who is subscribed. The record is
 * `/subscribers/<token>`, `{ email, locale, createdAt }`, and `confirmedAt` once
 * confirmed: the consent and its timestamp. The token is the key and the secret in
 * every link; no IP is stored.
 *
 * Confirm and unsubscribe are POSTs from the pages the emails link to, never a GET:
 * mail scanners open links on their own, and would confirm or unsubscribe people
 * who never clicked. RFC 8058's one-click is the one exception that carries the
 * token in the query: a mail client POSTs it to the `List-Unsubscribe` URL, and it
 * gets a plain 200.
 *
 * Announce: `deploy.yml` posts it with `X-Announce` once the hosting deploy is live,
 * so every link already works. Horses newly `available` are marked in `/announced`
 * first and mailed second: a failed send loses one announcement, and nobody is ever
 * mailed twice. The first run only marks the current stock.
 * ponytail: Resend's free plan sends 100 mails a day, so ~100 confirmed subscribers
 * per announcement; the paid plan is the upgrade. The read is after the build, so a
 * horse saved in the seconds between the two can link to a page not live yet. The
 * list has no panel view: an erasure request is a delete in the console.
 */
const signupHits = new Map();
let signups = 0;
let signupWindow = Date.now();
const announceToken = defineSecret('ANNOUNCE_TOKEN');
// `randomBytes(24)` in base64url; the pattern also keeps a token out of any other path.
const tokenPattern = /^[\w-]{32}$/;

async function subscribe(req, res) {
  if (Date.now() - signupWindow > 60 * 60 * 1000) {
    signupHits.clear();
    signups = 0;
    signupWindow = Date.now();
  }
  const body = req.body ?? {};
  const to = paths(body.locale);
  const ip =
    req.get('fastly-client-ip') ?? req.get('x-forwarded-for')?.split(',')[0].trim() ?? req.ip;
  const count = (signupHits.get(ip) ?? 0) + 1;
  signupHits.set(ip, count);
  if (count > perHour) return res.redirect(303, to.failed);
  if (body.website || fromChannel(req)) return res.redirect(303, to.sent);

  const signup = parseSignup(body);
  if (!signup) return res.redirect(303, to.failed);
  const token = body['cf-turnstile-response'];
  if (!(typeof token === 'string' && token && (await human(token))))
    return res.redirect(303, to.failed);
  if (++signups > allPerHour) return res.redirect(303, to.failed);

  const list = getDatabase().ref('subscribers');
  const [old] = Object.entries(
    (await list.orderByChild('email').equalTo(signup.email).get()).val() ?? {},
  );
  // Confirmed, or a confirmation mailed in the last 10 minutes: nothing new to send.
  if (old && (old[1].confirmedAt || Date.now() - old[1].createdAt < 10 * 60 * 1000))
    return res.redirect(303, to.sent);
  if (old) await list.child(old[0]).remove();

  const id = randomBytes(24).toString('base64url');
  await list.child(id).set({ ...signup, createdAt: ServerValue.TIMESTAMP });
  try {
    await resend('/emails', {
      from,
      to: signup.email,
      reply_to: replyTo,
      ...confirmEmail(signup.locale, id),
    });
  } catch (e) {
    logger.error(`notify: confirmation: ${e.message}`);
    await list.child(id).remove();
    return res.redirect(303, to.failed);
  }
  res.redirect(303, to.sent);
}

async function confirm(req, res) {
  const { t, locale } = req.body ?? {};
  const fail = paths(locale).failed;
  if (typeof t !== 'string' || !tokenPattern.test(t)) return res.redirect(303, fail);
  const ref = getDatabase().ref(`subscribers/${t}`);
  const s = (await ref.get()).val();
  if (!s || (!s.confirmedAt && Date.now() - s.createdAt > confirmWindow))
    return res.redirect(303, fail);
  if (!s.confirmedAt) await ref.update({ confirmedAt: ServerValue.TIMESTAMP });
  res.redirect(303, paths(s.locale).confirmed);
}

async function unsubscribe(req, res) {
  const oneClick = req.query.t;
  const t = oneClick ?? req.body?.t;
  if (typeof t !== 'string' || !tokenPattern.test(t)) {
    if (oneClick) return res.status(400).send('bad token');
    return res.redirect(303, paths(req.body?.locale).failed);
  }
  // Gone whether or not it was there: unsubscribing twice is not an error.
  await getDatabase().ref(`subscribers/${t}`).remove();
  if (oneClick) return res.status(200).send('unsubscribed');
  res.redirect(303, paths(req.body?.locale).unsubscribed);
}

async function announce(req, res) {
  if (!matches(req.get('x-announce'), announceToken.value()))
    return res.status(403).send('forbidden');
  const db = getDatabase();
  const [horses, announced, subscribers] = await Promise.all(
    ['horses', 'announced', 'subscribers'].map((p) =>
      db
        .ref(p)
        .get()
        .then((s) => s.val()),
    ),
  );
  const { seed, fresh } = toAnnounce(horses, announced);
  const marked = [...seed, ...fresh.map((h) => h.slug)];
  if (marked.length)
    await db.ref('announced').update(Object.fromEntries(marked.map((s) => [s, Date.now()])));

  const emails = !fresh.length
    ? []
    : Object.entries(subscribers ?? {})
        .filter(([, s]) => s?.confirmedAt)
        .map(([id, s]) => ({
          from,
          to: s.email,
          reply_to: replyTo,
          headers: {
            'List-Unsubscribe': `<${oneClickUrl(id)}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
          ...announceEmail(s.locale, fresh, id),
        }));
  let failed = 0;
  // Resend's batch endpoint takes 100 at a time.
  for (let i = 0; i < emails.length; i += 100) {
    const batch = emails.slice(i, i + 100);
    try {
      await resend('/emails/batch', batch);
    } catch (e) {
      failed += batch.length;
      logger.error(`notify: announce: ${e.message}`);
    }
  }
  const sent = emails.length - failed;
  logger.info(`notify: announced ${fresh.length} horse(s) to ${sent}`);
  res.json({ seeded: seed.length, announced: fresh.map((h) => h.slug), sent, failed });
}

const notifyRoutes = {
  '/': subscribe,
  '/confirm': confirm,
  '/unsubscribe': unsubscribe,
  '/announce': announce,
};

export const newHorses = onRequest(
  {
    region: 'europe-central2',
    maxInstances: 1,
    timeoutSeconds: 120,
    secrets: [turnstile, resendKey, announceToken],
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.set('Allow', 'POST').status(405).send('POST only');
      return;
    }
    // Through the rewrite the path keeps `/api/notify`; on the function's own URL it does not.
    const route = notifyRoutes[req.path.replace(/^\/api\/notify/, '').replace(/\/$/, '') || '/'];
    if (!route) {
      res.status(404).send('not found');
      return;
    }
    try {
      await route(req, res);
    } catch (e) {
      // A database or network failure: the failure page, never a bare error body (E5.7).
      logger.error(`notify: ${req.path}: ${e.message}`);
      if (res.headersSent) return;
      // Announce answers `deploy.yml`'s curl, which fails the step on a 500, not on a 303.
      if (route === announce) res.status(500).send('announce failed');
      else res.redirect(303, paths(req.body?.locale).failed);
    }
  },
);

/*
 * What the privacy notice promises, once a day in one job: an unconfirmed signup is
 * gone after 7 days, and a handled enquiry six months after it was handled (E7.7).
 * The mailbox and Telegram copies are the monthly routine in `/admin/poradnik`.
 */
export const retention = onSchedule(
  { schedule: '0 4 * * *', timeZone: 'Europe/Warsaw', region: 'europe-central2' },
  async () => {
    const list = getDatabase().ref('subscribers');
    const all = (await list.get()).val() ?? {};
    const stale = Object.keys(all).filter(
      (id) => !all[id]?.confirmedAt && Date.now() - (all[id]?.createdAt ?? 0) > confirmWindow,
    );
    if (stale.length) await list.update(Object.fromEntries(stale.map((id) => [id, null])));
    logger.info(`notify: deleted ${stale.length} unconfirmed signup(s)`);

    const enquiries = getDatabase().ref('enquiries');
    const update = expired((await enquiries.get()).val());
    const deleted = Object.values(update).filter((v) => v === null).length;
    if (Object.keys(update).length) await enquiries.update(update);
    logger.info(
      `enquiry: deleted ${deleted}, started the clock on ${Object.keys(update).length - deleted}`,
    );
  },
);
