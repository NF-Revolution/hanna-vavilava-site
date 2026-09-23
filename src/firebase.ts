/*
 * The web app's Firebase config (`firebase apps:sdkconfig WEB`). Public by
 * design: the API key identifies the project, it does not unlock it — the
 * database rules and the `admin` claim do. Imported only by the admin panel,
 * so the SDK never reaches a public page.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyCnJ2u71mjosPfJQDr5IqeLVA_O0bLeacE',
  authDomain: 'hanna-vavilava-site.firebaseapp.com',
  databaseURL: 'https://hanna-vavilava-site-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'hanna-vavilava-site',
  appId: '1:894554818339:web:711eb3aafb557b44ebae96',
};
