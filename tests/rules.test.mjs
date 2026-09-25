/*
 * Database and storage rules against the emulators' REST APIs. `npm test` starts the
 * emulator on the `demo-hv` project, which cannot reach production.
 *
 * Tokens are unsigned JWTs: the emulator reads their claims without checking
 * a signature, which is what lets a test be the admin.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

const host = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
const ns = 'demo-hv-default-rtdb';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const token = (claims) => {
  const now = Math.floor(Date.now() / 1000);
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({
    iss: 'https://securetoken.google.com/demo-hv',
    aud: 'demo-hv',
    iat: now,
    exp: now + 3600,
    auth_time: now,
    sub: 'u1',
    user_id: 'u1',
    firebase: { sign_in_provider: 'password', identities: {} },
    ...claims,
  })}.`;
};
const admin = token({ admin: true });
const user = token({});

const call = (method, path, auth, body) =>
  fetch(`http://${host}/${path}.json?ns=${ns}${auth ? `&auth=${auth}` : ''}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then((r) => r.status);

const cases = [
  ['anonymous write to /horses fails', 'PUT', 'horses/cascada', null, 401],
  ['anonymous push to /enquiries fails', 'POST', 'enquiries', null, 401],
  ['anonymous read of /enquiries fails', 'GET', 'enquiries', null, 401],
  ['anonymous push to /subscribers fails', 'POST', 'subscribers', null, 401],
  ['anonymous read of /horses fails', 'GET', 'horses', null, 401],
  ['non-admin write to /horses fails', 'PUT', 'horses/cascada', user, 401],
  ['non-admin read of /enquiries fails', 'GET', 'enquiries', user, 401],
  ['non-admin write to /enquiries fails', 'PUT', 'enquiries/x/handled', user, 401],
  ['admin writes /horses', 'PUT', 'horses/cascada', admin, 200],
  ['admin writes /site', 'PUT', 'site', admin, 200],
  ['admin reads /enquiries', 'GET', 'enquiries', admin, 200],
  ['admin marks an enquiry handled', 'PUT', 'enquiries/x/handled', admin, 200],
  ['admin push to an unknown path fails', 'POST', 'other', admin, 401],
];

for (const [name, method, path, auth, status] of cases) {
  test(name, async () => {
    assert.equal(await call(method, path, auth, method === 'GET' ? undefined : { a: 1 }), status);
  });
}

/* Storage (E2.5): the same unsigned tokens, sent the way the web SDK sends them. */
const storageHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
const bucket = `http://${storageHost}/v0/b/hanna-vavilava-site/o`;
const upload = (path, auth, type = 'image/jpeg') =>
  fetch(`${bucket}?name=${encodeURIComponent(path)}`, {
    method: 'POST',
    headers: { 'Content-Type': type, ...(auth && { Authorization: `Firebase ${auth}` }) },
    body: 'jpeg',
  }).then((r) => r.status);
const photo = `${bucket}/${encodeURIComponent('photos/cascada/a.jpg')}`;

const uploads = [
  ['anonymous photo upload fails', 'photos/cascada/b.jpg', null, 'image/jpeg', 403],
  ['non-admin photo upload fails', 'photos/cascada/b.jpg', user, 'image/jpeg', 403],
  [
    'admin PNG upload fails — only the re-encoded JPEG passes',
    'photos/cascada/b.png',
    admin,
    'image/png',
    403,
  ],
  ['admin upload outside photos/ fails', 'other/a.jpg', admin, 'image/jpeg', 403],
];
for (const [name, path, auth, type, status] of uploads) {
  test(name, async () => assert.equal(await upload(path, auth, type), status));
}

test('admin uploads a photo, anyone reads it, nobody deletes it', async () => {
  assert.equal(await upload('photos/cascada/a.jpg', admin), 200);
  assert.equal((await fetch(`${photo}?alt=media`)).status, 200);
  const del = await fetch(photo, {
    method: 'DELETE',
    headers: { Authorization: `Firebase ${admin}` },
  });
  assert.equal(del.status, 403);
});

/*
 * The Functions refuse anyone without the admin claim, before they write or sign
 * anything. The admin paths need real GitHub and R2 credentials and are not run here.
 */
const callFn = (name, auth, data = null) =>
  fetch(`http://127.0.0.1:5001/demo-hv/europe-central2/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth && { Authorization: `Bearer ${auth}` }),
    },
    body: JSON.stringify({ data }),
  }).then((r) => r.status);
const publish = (auth) => callFn('publish', auth);

test('Publish refuses anonymous and non-admin callers and stamps nothing', async () => {
  assert.equal(await publish(null), 403);
  assert.equal(await publish(user), 403);
  const updated = await fetch(
    `http://${host}/site/updated.json?ns=hanna-vavilava-site-default-rtdb`,
    { headers: { Authorization: 'Bearer owner' } },
  ).then((r) => r.json());
  assert.equal(updated, null);
});

test('X-ray upload and delete refuse non-admins, an oversize file and a key outside X-rays', async () => {
  const upload = { slug: 'cascada', takenOn: '2026-03-04', bytes: 1 };
  assert.equal(await callFn('xrayUpload', null, upload), 403);
  assert.equal(await callFn('xrayUpload', user, upload), 403);
  assert.equal(await callFn('xrayUpload', admin, { ...upload, bytes: 100 * 1024 * 1024 + 1 }), 400);
  assert.equal(await callFn('xrayUpload', admin, { ...upload, slug: '../videos' }), 400);
  assert.equal(await callFn('xrayDelete', user, { keys: ['cascada/sales-1a2b3c4d.mp4'] }), 403);
  assert.equal(await callFn('xrayDelete', admin, { keys: ['cascada/sales-1a2b3c4d.mp4'] }), 400);
});
