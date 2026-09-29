/*
 * The Telegram message and the campaign source (#43). Pure: nothing here is sent.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { campaign, parseEnquiry } from '../functions/enquiry.js';
import { labels, telegramMessage, waReply } from '../functions/notify.js';
import pl from '../src/i18n/pl.json' with { type: 'json' };

const record = {
  name: 'Anna Kowalska',
  country: 'Poland',
  whatsapp: '+48600123456',
  level: 'amateur110',
  budget: '20-30',
  timeframe: 'season',
  horse: 'grandessa',
  locale: 'en',
};

test('the Polish labels match the form', () => {
  for (const key of ['levels', 'budgets', 'timeframes'])
    assert.deepEqual(labels[key], pl.enquiryForm[key], key);
});

test('the source is the page’s UTM tags, else the previous page’s, else an outside host', () => {
  const site = 'https://hannavavilava.com';
  assert.equal(
    campaign(`${site}/konie/x?utm_source=instagram&utm_medium=social&utm_campaign=bio`, ''),
    'instagram / social / bio',
  );
  assert.equal(campaign(`${site}/konie/x`, `${site}/?utm_source=instagram`), 'instagram');
  assert.equal(campaign(`${site}/konie/x`, 'https://l.instagram.com/'), 'l.instagram.com');
  assert.equal(campaign(`${site}/konie/x`, `${site}/konie`), undefined);
  assert.equal(campaign(`${site}/konie/x`, ''), undefined);
  assert.equal(campaign(undefined, 'not a url'), undefined);
});

test('the stored record keeps the page and the source, never the referrer', () => {
  const parsed = parseEnquiry({
    ...record,
    page: 'https://hannavavilava.com/en/horses/grandessa',
    ref: 'https://www.google.com/',
  });
  assert.equal(parsed.page, 'https://hannavavilava.com/en/horses/grandessa');
  assert.equal(parsed.source, 'www.google.com');
  assert.equal('ref' in parsed, false);
});

test('the reply link is the bare number with a greeting in the buyer’s language', () => {
  assert.equal(
    waReply(record, 'Grandessa'),
    'https://wa.me/48600123456?text=' +
      encodeURIComponent(
        'Hello Anna, this is Hanna Vavilava. Thank you for your enquiry about Grandessa.',
      ),
  );
  const pl = decodeURIComponent(new URL(waReply({ ...record, locale: 'pl' })).search.slice(6));
  assert.equal(pl, 'Dzień dobry, tu Hanna Vavilava. Dziękuję za zapytanie.');
});

test('the message escapes what the buyer typed and links only a real handle', () => {
  const { text, reply_markup } = telegramMessage(
    { ...record, note: '<b>&</b>', instagram: 'hv.stable', source: 'instagram' },
    'Grandessa',
  );
  assert.match(text, /^Zapytanie: <b>Grandessa<\/b> · EN\n/);
  assert.match(text, /„&lt;b&gt;&amp;&lt;\/b&gt;”/);
  assert.match(text, /<a href="https:\/\/instagram.com\/hv.stable">@hv.stable<\/a>/);
  assert.match(text, /Amator, parkury do 110 cm · 20 000 – 30 000 EUR · W tym sezonie/);
  assert.match(text, /Źródło: instagram/);
  assert.equal(reply_markup.inline_keyboard[0][0].url, waReply(record, 'Grandessa'));

  const odd = telegramMessage({ ...record, instagram: 'a"b' }).text;
  assert.match(odd, /Instagram a"b/);
  assert.doesNotMatch(odd, /<a /);
  assert.match(odd, /konia jeszcze nie wybrano/);
});
