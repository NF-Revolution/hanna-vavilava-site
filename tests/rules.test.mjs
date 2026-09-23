/*
 * Database rules against the emulator's REST API. `npm test` starts the
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
  ['admin writes /horses', 'PUT', 'horses/cascada', admin, 200],
  ['admin writes /site', 'PUT', 'site', admin, 200],
  ['admin reads /enquiries', 'GET', 'enquiries', admin, 200],
  ['admin push to an unknown path fails', 'POST', 'other', admin, 401],
];

for (const [name, method, path, auth, status] of cases) {
  test(name, async () => {
    assert.equal(await call(method, path, auth, method === 'GET' ? undefined : { a: 1 }), status);
  });
}
