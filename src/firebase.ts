/*
 * The web app's Firebase config (`firebase apps:sdkconfig WEB`). Public by
 * design: the API key identifies the project, it does not unlock it — the
 * database and storage rules and the `admin` claim do. Holds no SDK import: the admin
 * panel imports the SDK itself, and `Photo.astro` reads `photoUrl` at build time only,
 * so the SDK never reaches a public page.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyCnJ2u71mjosPfJQDr5IqeLVA_O0bLeacE',
  authDomain: 'hanna-vavilava-site.firebaseapp.com',
  databaseURL: 'https://hanna-vavilava-site-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'hanna-vavilava-site',
  appId: '1:894554818339:web:711eb3aafb557b44ebae96',
  /* US-EAST1, not the project's Warsaw default: inside Cloud Storage's Always Free tier (E2.5). */
  storageBucket: 'hanna-vavilava-site',
};

/* A photo's public URL — `storage.rules` allows anonymous reads under `photos/`. */
export const photoUrl = (key: string) =>
  `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${encodeURIComponent(key)}?alt=media`;
