/*
 * The Publish button's backend (E2.6). The site reads the database only at
 * build time (E2.2), so a saved edit reaches visitors when this rebuilds it:
 * stamp the "stan stajni" date, then ask GitHub to run `deploy.yml`.
 *
 * Deployed by hand, like the rules:
 *
 *   npx firebase-tools@15 functions:secrets:set PUBLISH_TOKEN --project hanna-vavilava-site
 *   npx firebase-tools@15 deploy --only functions --project hanna-vavilava-site
 */
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

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

export const publish = onCall({ region: 'europe-central2', secrets: [token] }, async (request) => {
  // onCall has already verified the ID token; the claim is ours to check, before any write.
  if (request.auth?.token.admin !== true) throw new HttpsError('permission-denied', 'admin only');

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
});
