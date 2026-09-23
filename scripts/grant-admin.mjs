/*
 * Grants the `admin` custom claim that every database rule checks (E2.1).
 * Run once per account, after creating it in the console:
 *
 *   gcloud auth application-default login
 *   npm run admin:grant -- hanna@example.com
 *
 * The panel force-refreshes the ID token, so a signed-in session picks the
 * claim up on its next reload without signing out.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];
if (!email) {
  console.error('usage: npm run admin:grant -- <email>');
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId: 'hanna-vavilava-site' });
const auth = getAuth();
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
console.log(`${email} (${user.uid}) is now admin`);
