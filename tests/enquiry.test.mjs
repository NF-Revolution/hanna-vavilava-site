/*
 * The enquiry schema against the form's dictionaries, then `submitEnquiry` itself on
 * the Functions emulator, writing to the database emulator (E5.3).
 *
 * The emulator reads `TURNSTILE_SECRET` from `functions/.secret.local`: Cloudflare's
 * public always-pass test secret, which accepts only the dummy token below (E5.6).
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { enquiryEmail, enquirySchema, expired, parseEnquiry } from '../functions/enquiry.js';
import { telegramMessage } from '../functions/notify.js';
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

const search = {
  kind: 'search',
  level: ' amator, 120 cm ',
  budget: '',
  height: '168+',
  age: '',
  when: 'wiosna',
  whatsapp: '+48 600-123 456',
  locale: 'en',
};

test('a search post parses with its kind, free-text wishes and a bare number', () => {
  assert.deepEqual(parseEnquiry({ ...search, website: '', elapsed: '9000' }), {
    kind: 'search',
    level: 'amator, 120 cm',
    height: '168+',
    when: 'wiosna',
    whatsapp: '+48600123456',
    locale: 'en',
  });
  assert.equal(parseEnquiry({ ...search, whatsapp: '' }), null);
  assert.equal(parseEnquiry({ ...search, whatsapp: undefined }), null);
  assert.equal(parseEnquiry({ ...search, when: 'x'.repeat(101) }), null);
  // Free text is the search form's only; the main form still takes codes alone.
  assert.equal(parseEnquiry({ ...valid, level: 'amator, 120 cm' }), null);
});

test('a search reaches the email and Telegram with its wishes and no name', () => {
  const record = parseEnquiry(search);
  const { subject, text } = enquiryEmail(record);
  assert.equal(subject, 'Szukają konia spoza listy — +48600123456');
  assert.match(text, /^Poziom: amator, 120 cm$/m);
  assert.match(text, /^Kiedy: wiosna$/m);
  assert.doesNotMatch(text, /Imię|Kraj|Koń|Budżet|undefined/);
  assert.match(text, /wa\.me\/48600123456\?text=Hello%2C%20this%20is/);
  const message = telegramMessage(record, undefined);
  assert.equal(
    message.text.split('\n').slice(0, 3).join('\n'),
    'Szukają konia spoza listy · EN\nWhatsApp +48600123456\nPoziom: amator, 120 cm · Wzrost: 168+ · Kiedy: wiosna',
  );
  assert.doesNotMatch(message.text, /undefined/);
});

test('Instagram is cut down to the handle however it was typed', () => {
  for (const typed of ['@hv.stable', 'hv.stable', 'https://www.instagram.com/hv.stable/?igsh=x'])
    assert.equal(parseEnquiry({ ...valid, instagram: typed }).instagram, 'hv.stable');
});

test('the email names the horse, links back on WhatsApp and skips empty fields', () => {
  const { subject, text } = enquiryEmail(parseEnquiry({ ...valid, horse: 'cascada' }));
  assert.equal(subject, 'Zapytanie: cascada — Anna Kowalska, Poland');
  assert.match(text, /^WhatsApp: \+48600123456 https:\/\/wa\.me\/48600123456\?text=/m);
  assert.match(text, /^Budżet: 20 000 – 30 000 EUR$/m);
  assert.doesNotMatch(text, /Instagram|Wiadomość/);
  assert.match(enquiryEmail(parseEnquiry(valid)).subject, /^Zapytanie: bez konia — /);
  assert.match(
    enquiryEmail(parseEnquiry({ ...valid, instagram: '@hv.stable' })).text,
    /^Instagram: https:\/\/instagram\.com\/hv\.stable$/m,
  );
});

test('a handled enquiry expires six months after handledAt, a sale never (E7.7)', () => {
  const now = Date.UTC(2026, 9, 5);
  const ago = (months) => Date.UTC(2026, 9 - months, 5);
  assert.deepEqual(
    expired(
      {
        old: { handled: true, handledAt: ago(7) },
        recent: { handled: true, handledAt: ago(5) },
        sold: { handled: true, handledAt: ago(7), sale: true },
        open: { createdAt: ago(9) },
        legacy: { handled: true, createdAt: ago(9) },
      },
      now,
    ),
    { old: null, 'legacy/handledAt': now },
  );
  assert.deepEqual(expired(null, now), {});
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
const human = { 'cf-turnstile-response': 'XXXX.DUMMY.TOKEN.XXXX' };
const post = (fields, method = 'POST', ip = '203.0.113.1') =>
  fetch('http://127.0.0.1:5001/demo-hv/europe-central2/submitEnquiry', {
    method,
    redirect: 'manual',
    ...(method === 'POST' && {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Fastly-Client-IP': ip },
      body: new URLSearchParams({ ...human, ...fields }),
    }),
  });

// A refusal is a 303 to the failure page, never to the sent one (E5.7).
const failed = async (fields, ip) => {
  const res = await post(fields, 'POST', ip);
  assert.equal(res.status, 303);
  return res.headers.get('location');
};

// One file, in order: the posts below share one address's limit of 5 and the hour's 20.
test('the endpoint stores a real enquiry, drops a bot silently and limits an address', async () => {
  const before = Object.keys((await enquiries()) ?? {}).length;

  const sent = await post({ ...valid, elapsed: '9000' });
  assert.equal(sent.status, 303);
  assert.equal(sent.headers.get('location'), '/en/enquiry/sent#+48600123456');
  const stored = Object.values(await enquiries());
  assert.equal(stored.length, before + 1);
  const record = stored.find((r) => r.name === 'Anna Kowalska');
  assert.equal(typeof record.createdAt, 'number');
  assert.equal(record.handled, undefined);
  assert.equal(record.website, undefined);
  assert.equal(record.kind, undefined);

  // The search form, from its own address, so this one's count of 5 stays as it was.
  const looked = await post({ ...search, locale: 'pl', elapsed: '9000' }, 'POST', '203.0.113.3');
  assert.equal(looked.headers.get('location'), '/zapytanie/wyslane#+48600123456');
  const wishes = Object.values(await enquiries()).find((r) => r.kind === 'search');
  assert.equal(wishes.when, 'wiosna');
  assert.equal(typeof wishes.createdAt, 'number');
  assert.equal(await failed({ ...search, whatsapp: '' }, '203.0.113.3'), '/en/enquiry/not-sent');

  // A filled honeypot and a too-fast submit both look sent, and write nothing.
  const trapped = await post({ ...valid, locale: 'pl', website: 'x' });
  assert.equal(trapped.status, 303);
  assert.equal(trapped.headers.get('location'), '/zapytanie/wyslane');
  assert.equal((await post({ ...valid, elapsed: '800' })).status, 303);
  assert.equal(Object.keys(await enquiries()).length, before + 2);

  assert.equal(await failed({ ...valid, whatsapp: '600' }), '/en/enquiry/not-sent');
  // Its own address, so the count below still reaches the limit on the fifth post.
  assert.equal(
    await failed({ ...valid, whatsapp: '600', locale: 'pl' }, '203.0.113.2'),
    '/zapytanie/niewyslane',
  );
  assert.equal((await post({}, 'GET')).status, 405);

  // No token, as without JavaScript: refused, not faked as sent, and nothing written.
  assert.equal(await failed({ ...valid, 'cf-turnstile-response': '' }), '/en/enquiry/not-sent');
  assert.equal(Object.keys(await enquiries()).length, before + 2);

  assert.equal(await failed(valid), '/en/enquiry/not-sent');
});

// Two verified posts so far. A caller of the direct URL forging a new address each time
// escapes the per-address limit, and still stops at 20 verified posts in the hour.
test('a flood from forged addresses stops at the hourly cap', async () => {
  const before = Object.keys(await enquiries()).length;
  for (let i = 3; i <= 20; i++)
    assert.equal((await post(valid, 'POST', `198.51.100.${i}`)).status, 303);
  assert.equal(await failed(valid, '198.51.100.99'), '/en/enquiry/not-sent');
  assert.equal(Object.keys(await enquiries()).length, before + 18);
});

// The hour's 20 are used up. A wrong probe secret is a buyer like any other and meets the
// cap. The emulator's always-pass secret passes any non-empty token, so Turnstile is not
// what stops it here. The daily probe (#49) gets through with the right secret and writes
// `/monitor/enquiry`, never the inbox.
test('the probe skips Turnstile and the cap, and stays out of the inbox', async () => {
  const before = Object.keys(await enquiries()).length;
  const probe = (secret, token = 'probe') =>
    fetch('http://127.0.0.1:5001/demo-hv/europe-central2/submitEnquiry', {
      method: 'POST',
      redirect: 'manual',
      headers: { 'Fastly-Client-IP': '203.0.113.9', 'X-Probe': secret },
      body: new URLSearchParams({ ...valid, 'cf-turnstile-response': token }),
    });
  const to = async (...args) => (await probe(...args)).headers.get('location');
  assert.equal(await to('emulator-probe-tokeX'), '/en/enquiry/not-sent');
  assert.match(await to('emulator-probe-token'), /^\/en\/enquiry\/sent#/);
  // No token at all, which a buyer is refused for: the probe does not need one.
  assert.match(await to('emulator-probe-token', ''), /^\/en\/enquiry\/sent#/);
  const last = await fetch(
    `http://${host}/monitor/enquiry.json?ns=hanna-vavilava-site-default-rtdb`,
    {
      headers: { Authorization: 'Bearer owner' },
    },
  ).then((r) => r.json());
  assert.equal(last.name, 'Anna Kowalska');
  assert.equal(typeof last.createdAt, 'number');
  assert.equal(Object.keys(await enquiries()).length, before);
});
