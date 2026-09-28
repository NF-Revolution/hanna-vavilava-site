/*
 * The enquiry schema against the form's dictionaries, then `submitEnquiry` itself on
 * the Functions emulator, writing to the database emulator (E5.3).
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { enquirySchema, parseEnquiry } from '../functions/enquiry.js';
import en from '../src/i18n/en.json' with { type: 'json' };
import pl from '../src/i18n/pl.json' with { type: 'json' };

const valid = {
  name: ' Anna Kowalska ',
  country: 'Poland',
  whatsapp: '+48 600-123 456',
  instagram: '',
  level: 'amateur110',
  budget: '20-30',
  timeframe: 'season',
  horse: 'undecided',
  note: '',
  locale: 'en',
};

test('a valid enquiry parses, trimmed, with the number bare and empty fields dropped', () => {
  assert.deepEqual(parseEnquiry({ ...valid, website: '', elapsed: '9000' }), {
    name: 'Anna Kowalska',
    country: 'Poland',
    whatsapp: '+48600123456',
    level: 'amateur110',
    budget: '20-30',
    timeframe: 'season',
    horse: 'undecided',
    locale: 'en',
  });
});

test('a number without its country code, an unknown code or a missing name fails', () => {
  assert.equal(parseEnquiry({ ...valid, whatsapp: '600 123 456' }), null);
  assert.equal(parseEnquiry({ ...valid, level: 'beginner' }), null);
  assert.equal(parseEnquiry({ ...valid, horse: '../x' }), null);
  assert.equal(parseEnquiry({ ...valid, name: '  ' }), null);
  assert.equal(parseEnquiry({ ...valid, locale: 'de' }), null);
  assert.equal(parseEnquiry(undefined), null);
});

test('Instagram is cut down to the handle however it was typed', () => {
  for (const typed of ['@hv.stable', 'hv.stable', 'https://www.instagram.com/hv.stable/?igsh=x'])
    assert.equal(parseEnquiry({ ...valid, instagram: typed }).instagram, 'hv.stable');
});

test('the schema and both dictionaries offer the same select codes', () => {
  for (const [field, key] of [
    ['level', 'levels'],
    ['budget', 'budgets'],
    ['timeframe', 'timeframes'],
  ]) {
    const codes = enquirySchema.shape[field].options;
    assert.deepEqual(Object.keys(pl.enquiryForm[key]), codes, `pl ${key}`);
    assert.deepEqual(Object.keys(en.enquiryForm[key]), codes, `en ${key}`);
  }
});

const host = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
const enquiries = () =>
  fetch(`http://${host}/enquiries.json?ns=hanna-vavilava-site-default-rtdb`, {
    headers: { Authorization: 'Bearer owner' },
  }).then((r) => r.json());
const post = (fields, method = 'POST') =>
  fetch('http://127.0.0.1:5001/demo-hv/europe-central2/submitEnquiry', {
    method,
    redirect: 'manual',
    ...(method === 'POST' && {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields),
    }),
  });

// One file, in order: every post below counts against the same address's limit of 5.
test('the endpoint stores a real enquiry, drops a bot silently and limits an address', async () => {
  const before = Object.keys((await enquiries()) ?? {}).length;

  const sent = await post({ ...valid, elapsed: '9000' });
  assert.equal(sent.status, 303);
  assert.equal(sent.headers.get('location'), '/en/enquiry/sent');
  const stored = Object.values(await enquiries());
  assert.equal(stored.length, before + 1);
  const record = stored.find((r) => r.name === 'Anna Kowalska');
  assert.equal(typeof record.createdAt, 'number');
  assert.equal(record.handled, undefined);
  assert.equal(record.website, undefined);

  // A filled honeypot and a too-fast submit both look sent, and write nothing.
  const trapped = await post({ ...valid, locale: 'pl', website: 'x' });
  assert.equal(trapped.status, 303);
  assert.equal(trapped.headers.get('location'), '/zapytanie/wyslane');
  assert.equal((await post({ ...valid, elapsed: '800' })).status, 303);
  assert.equal(Object.keys(await enquiries()).length, before + 1);

  assert.equal((await post({ ...valid, whatsapp: '600' })).status, 400);
  assert.equal((await post({}, 'GET')).status, 405);

  assert.equal((await post(valid)).status, 303);
  assert.equal((await post(valid)).status, 429);
});
