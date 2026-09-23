import { test } from 'node:test';
import assert from 'node:assert/strict';
import { horseSchema } from '../src/horse.ts';
import { fromFields, toFields } from '../src/horse-form.ts';
import { fit } from '../src/photo.ts';

const t = (pl) => ({ pl, en: pl });
const cascada = {
  name: 'Cascada',
  sex: 'mare',
  born: 2017,
  heightCm: 168,
  breed: 'SP',
  pedigree: 'Chacco-Blue × Larena (Cassini II)',
  levelCm: 125,
  price: 32000,
  seller: 'company',
  headline: t('Cztery starty w 125 cm w sezonie 2026'),
  facts: Object.fromEntries(
    [
      'breeding',
      'trainingLevel',
      'lastStart',
      'starts',
      'technique',
      'rideability',
      'temperament',
      'handling',
      'location',
      'documents',
    ].map((k) => [k, t(k)]),
  ),
  suits: [t('Jeździec amator startujący w 110–120 cm')],
  notFor: [],
  health: {
    vaccinations: t('Grypa i tężec — 12.08.2026'),
    dewormedOn: '2026-07-21',
    knownIssues: t('Brak'),
  },
  xrays: { count: 18, takenOn: '2026-03-04', scope: t('nogi przednie i tylne') },
  viewing: { lead: t('3–5 dni'), airport: t('WAW — 55 min'), visitDay: t('…') },
  videos: [
    {
      key: 'cascada/sales-1a2b3c4d.mp4',
      kind: 'sales',
      posterKey: 'cascada/sales-1a2b3c4d.jpg',
      durationS: 108,
      transcript: t('…'),
    },
  ],
  photos: [
    { key: 'photos/cascada/1a2b3c4d.jpg', alt: t('Cascada nad oxerem 125 cm'), caption: t('') },
    { key: 'photos/cascada/5e6f7a8b.jpg', alt: t('Głowa, z profilu'), caption: t('głowa') },
  ],
};

test('a full horse parses, and a study starts with no files', () => {
  assert.deepEqual(horseSchema.parse(cascada).xrays?.files, []);
});

test('price on request is null, never zero', () => {
  assert.equal(horseSchema.parse({ ...cascada, price: null }).price, null);
  assert.equal(horseSchema.safeParse({ ...cascada, price: 0 }).success, false);
});

test('a horse read back from the database, nulls and empty lists dropped, still parses', () => {
  const { price, xrays, suits, notFor, videos, photos, ...stored } = cascada;
  const horse = horseSchema.parse(stored);
  assert.equal(horse.price, null);
  assert.equal(horse.xrays, null);
  assert.deepEqual([horse.suits, horse.notFor, horse.videos, horse.photos], [[], [], [], []]);
});

test('an owner field fails the parse', () => {
  assert.equal(horseSchema.safeParse({ ...cascada, owner: 'Jan Kowalski' }).success, false);
});

test('media is an object key, never a URL', () => {
  const videos = [{ ...cascada.videos[0], key: 'https://hv-media.nfrevolution.com/cascada/a.mp4' }];
  assert.equal(horseSchema.safeParse({ ...cascada, videos }).success, false);
});

test('the admin form round-trips a horse, status, order and photos included', () => {
  const horse = horseSchema.parse({ ...cascada, status: 'reserved', order: 2 });
  assert.deepEqual(horseSchema.parse(fromFields(toFields(horse))), horse);
});

test('a blank price and a blank X-ray block are null, as the form leaves them', () => {
  const fields = {
    ...toFields(horseSchema.parse(cascada)),
    price: undefined,
    'xrays.count': undefined,
    'xrays.takenOn': '',
    'xrays.scope.pl': '',
    'xrays.scope.en': '',
    'xrays.files': '',
  };
  const horse = horseSchema.parse(fromFields(fields));
  assert.equal(horse.price, null);
  assert.equal(horse.xrays, null);
});

test('a PL list longer than its EN twin, or broken JSON, fails the parse', () => {
  const fields = toFields(horseSchema.parse(cascada));
  const uneven = { ...fields, 'suits.pl': 'jeden\ndwa', 'suits.en': 'one' };
  assert.equal(horseSchema.safeParse(fromFields(uneven)).success, false);
  assert.equal(horseSchema.safeParse(fromFields({ ...fields, videos: '[{' })).success, false);
});

test('a photo without alt text in both languages fails the parse', () => {
  const photos = [{ ...cascada.photos[0], alt: { pl: 'Cascada', en: '  ' } }];
  assert.equal(horseSchema.safeParse({ ...cascada, photos }).success, false);
});

test('a photo is scaled to a 2400 px long edge and never up', () => {
  assert.deepEqual(fit(4032, 3024), [2400, 1800]);
  assert.deepEqual(fit(3024, 4032), [1800, 2400]);
  assert.deepEqual(fit(800, 600), [800, 600]);
});
