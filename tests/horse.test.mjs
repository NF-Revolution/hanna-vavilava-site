import { test } from 'node:test';
import assert from 'node:assert/strict';
import { horseSchema } from '../src/horse.ts';

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
  photos: [],
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
