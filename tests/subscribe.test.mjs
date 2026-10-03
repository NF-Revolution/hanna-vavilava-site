/*
 * The new-horse list (E5.9): the pure parts, then `newHorses` on the Functions emulator.
 * The emulator has no `RESEND_API_KEY`, so every mail fails: a signup must then leave
 * nothing behind, and announce must still mark before it sends.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  announceEmail,
  confirmEmail,
  parseSignup,
  paths,
  toAnnounce,
} from '../functions/subscribe.js';
import { routes } from '../src/i18n/routes.ts';

test('a signup needs a real address and a ticked box', () => {
  const ok = { email: ' Anna@Example.COM ', consent: 'yes', locale: 'en' };
  assert.deepEqual(parseSignup(ok), { email: 'anna@example.com', locale: 'en' });
  assert.equal(parseSignup({ ...ok, consent: '' }), null);
  assert.equal(parseSignup({ ...ok, consent: undefined }), null);
  assert.equal(parseSignup({ ...ok, email: 'not-an-address' }), null);
  assert.equal(parseSignup({ ...ok, locale: 'de' }), null);
});

test('the mirrored paths match the routes table', () => {
  for (const locale of ['pl', 'en']) {
    const p = paths(locale);
    for (const [key, route] of Object.entries({
      sent: 'notifySent',
      confirm: 'notifyConfirm',
      confirmed: 'notifyConfirmed',
      unsubscribe: 'notifyUnsubscribe',
      unsubscribed: 'notifyUnsubscribed',
      failed: 'notifyFailed',
      horse: 'horse',
    }))
      assert.equal(p[key], routes[route][locale], `${locale} ${key}`);
  }
});

test('the emails carry the token in a fragment and an unsubscribe link', () => {
  const c = confirmEmail('pl', 'T0K3N');
  assert.match(c.text, /\/powiadomienia\/potwierdz#T0K3N/);
  const a = announceEmail('en', [{ slug: 'cascada', name: 'Cascada' }], 'T0K3N');
  assert.match(a.subject, /Cascada/);
  assert.match(a.text, /\/en\/horses\/cascada/);
  assert.match(a.text, /\/en\/new-horses\/unsubscribe#T0K3N/);
  assert.match(a.text, /CEWET TAS/);
});

test('the first announce seeds the stock; later ones pick only new available horses', () => {
  const horses = {
    a: { status: 'available', name: 'A' },
    b: { status: 'reserved', name: 'B' },
    c: { status: 'sold', name: 'C' },
  };
  assert.deepEqual(toAnnounce(horses, null), { seed: ['a', 'b'], fresh: [] });
  assert.deepEqual(
    toAnnounce({ ...horses, d: { status: 'available', name: 'D' } }, { a: 1, b: 1 }),
    {
      seed: [],
      fresh: [{ slug: 'd', name: 'D' }],
    },
  );
  // A reserved horse coming back is not news; it was marked when first seen.
  assert.deepEqual(toAnnounce({ b: { status: 'available', name: 'B' } }, { b: 1 }).fresh, []);
});

const host = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
const db = (path, method = 'GET', body) =>
  fetch(`http://${host}/${path}.json?ns=hanna-vavilava-site-default-rtdb`, {
    method,
    headers: { Authorization: 'Bearer owner' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then((r) => r.json());
const fn = (path, body, headers = {}) =>
  fetch(`http://127.0.0.1:5001/demo-hv/europe-central2/newHorses${path}`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Fastly-Client-IP': '203.0.113.50', ...headers },
    body: body && new URLSearchParams(body),
  });
const to = async (...args) => (await fn(...args)).headers.get('location');
const token = (c) => c.repeat(32);

// The emulator loads `database.rules.json` into `demo-hv` only; the Functions write to the
// production name, which needs the rules' email index for the lookup.
test('the Functions namespace gets the real rules', async () => {
  const rules = await readFile(new URL('../database.rules.json', import.meta.url), 'utf8');
  const res = await fetch(
    `http://${host}/.settings/rules.json?ns=hanna-vavilava-site-default-rtdb`,
    { method: 'PUT', headers: { Authorization: 'Bearer owner' }, body: rules },
  );
  assert.equal(res.status, 200);
});

test('a signup whose confirmation cannot be mailed leaves nothing behind', async () => {
  const signup = {
    email: 'buyer@example.com',
    consent: 'yes',
    locale: 'pl',
    'cf-turnstile-response': 'XXXX.DUMMY.TOKEN.XXXX',
  };
  assert.equal(await to('', { ...signup, consent: '' }), '/powiadomienia/niezapisano');
  assert.equal(await to('', { ...signup, website: 'x' }), '/powiadomienia/sprawdz');
  assert.equal(await to('', signup), '/powiadomienia/niezapisano');
  const left = Object.values((await db('subscribers')) ?? {});
  assert.equal(left.filter((s) => s.email === 'buyer@example.com').length, 0);
});

test('confirm stamps the consent once, and refuses an expired or unknown token', async () => {
  await db(`subscribers/${token('a')}`, 'PUT', {
    email: 'a@example.com',
    locale: 'en',
    createdAt: Date.now(),
  });
  await db(`subscribers/${token('b')}`, 'PUT', {
    email: 'b@example.com',
    locale: 'pl',
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
  });
  assert.equal(await to('/confirm', { t: token('a'), locale: 'pl' }), '/en/new-horses/confirmed');
  const stamped = (await db(`subscribers/${token('a')}`)).confirmedAt;
  assert.equal(typeof stamped, 'number');
  assert.equal(await to('/confirm', { t: token('a') }), '/en/new-horses/confirmed');
  assert.equal((await db(`subscribers/${token('a')}`)).confirmedAt, stamped);

  assert.equal(await to('/confirm', { t: token('b'), locale: 'pl' }), '/powiadomienia/niezapisano');
  assert.equal((await db(`subscribers/${token('b')}`)).confirmedAt, undefined);
  assert.equal(await to('/confirm', { t: token('z'), locale: 'en' }), '/en/new-horses/failed');
  assert.equal(await to('/confirm', { t: '../horses', locale: 'en' }), '/en/new-horses/failed');
});

test('unsubscribe deletes the record, from the page and from one-click', async () => {
  await db(`subscribers/${token('c')}`, 'PUT', {
    email: 'c@example.com',
    locale: 'pl',
    createdAt: Date.now(),
    confirmedAt: Date.now(),
  });
  assert.equal(
    await to('/unsubscribe', { t: token('c'), locale: 'pl' }),
    '/powiadomienia/wypisano',
  );
  assert.equal(await db(`subscribers/${token('c')}`), null);

  await db(`subscribers/${token('d')}`, 'PUT', {
    email: 'd@example.com',
    locale: 'en',
    createdAt: 1,
  });
  const res = await fn(`/unsubscribe?t=${token('d')}`, { 'List-Unsubscribe': 'One-Click' });
  assert.equal(res.status, 200);
  assert.equal(await db(`subscribers/${token('d')}`), null);
  assert.equal((await fn('/unsubscribe?t=bad', {})).status, 400);
});

test('announce needs its secret, and its first run only marks the stock', async () => {
  assert.equal((await fn('/announce', {}, { 'X-Announce': 'wrong' })).status, 403);
  assert.equal(
    (await fetch('http://127.0.0.1:5001/demo-hv/europe-central2/newHorses')).status,
    405,
  );
  assert.equal((await fn('/nope', {})).status, 404);

  await db('announced', 'DELETE');
  await db('horses/seeded-horse', 'PUT', { status: 'available', name: 'Seeded' });
  const first = await (
    await fn('/announce', {}, { 'X-Announce': 'emulator-announce-token' })
  ).json();
  assert.equal(first.announced.length, 0);
  assert.equal(typeof (await db('announced/seeded-horse')), 'number');

  // A new horse is marked even though the mail fails: at most once, never twice.
  await db('horses/fresh-horse', 'PUT', { status: 'available', name: 'Fresh' });
  const second = await (
    await fn('/announce', {}, { 'X-Announce': 'emulator-announce-token' })
  ).json();
  assert.deepEqual(second.announced, ['fresh-horse']);
  assert.equal(typeof (await db('announced/fresh-horse')), 'number');
  const third = await (
    await fn('/announce', {}, { 'X-Announce': 'emulator-announce-token' })
  ).json();
  assert.deepEqual(third.announced, []);
});
