import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { bundleName, result, rows, searchTerm, startFacts } from '../functions/starts.js';

/*
 * Lotus Blue's 2026 rows as the live API returned them on 2026-09-28 (#122), newest first,
 * plus a decoy and a 2025 start. `wysokosc_p` is a string, two-phase rounds `"120/120"`,
 * and a class can already carry the height (`L 100`).
 */
const row = (data, s_zawodnik, klasa, wysokosc_p, miejsce, ukonczyl, s_kon = 'LOTUS BLUE B&C') => ({
  id_zawodow: Number(data.replaceAll('-', '')) || 1,
  data,
  s_kon,
  s_zawodnik,
  klasa,
  wysokosc_p,
  miejsce,
  ukonczyl,
});
const sample = [
  row('2026-09-12', 'Hanna Vavilava', 'C', '130/130', '', 0),
  row('2026-09-12', 'Hanna Vavilava', 'N', '120/120', '2', 1),
  row('2026-09-05', 'Oliwia Wieczorek', 'L 100', '100', '9', 1),
  row('2026-09-04', 'Hanna Vavilava', 'N', '120', '35', 1),
  row('2026-09-03', 'Hanna Vavilava', 'N', '120', '35', 1),
  row('2026-07-31', 'Hanna Vavilava', 'N', '120', '1', 1),
  row('2026-07-31', 'Hanna Vavilava', 'P', '110', '13', 1),
  row('2026-09-13', 'Someone Else', 'N', '120', '1', 1, 'LOTUS BLUE II'),
  row('2025-06-01', 'Hanna Vavilava', 'L', '100', '11', 1),
];
const lotus = (raw) => rows(raw, 'LOTUS BLUE B&C');

test('every start of the exact name counts', () => {
  const starts = lotus(sample);
  assert.equal(starts.length, 8);
  assert.deepEqual(startFacts(starts).starts, {
    pl: '8 · 2026: 7 · 2025: 1',
    en: '8 · 2026: 7 · 2025: 1',
  });
});

/* Lotus Blue's 2026 rows as the live API returned them on 2026-10-20 (#190), fields trimmed. */
const live = lotus(
  JSON.parse(readFileSync(new URL('./livejumping-lotus-2026.json', import.meta.url))),
);

test('the last show is every round of the newest show with a finished round', () => {
  // Sielanka (04.10, one round, ELI) is newer, but has no finished round; Beckersport ran two days.
  assert.deepEqual(startFacts(live).lastShow, {
    name: 'HALOWE ZAWODY REGIONALNE I TOWARZYSKIE - BECKERSPORT',
    venue: 'Beckersport',
    from: '2026-10-10',
    to: '2026-10-11',
    rounds: [
      { date: '2026-10-11', round: 'N 120 cm', place: 11, result: '4 / 71,50' },
      { date: '2026-10-11', round: 'P 110 cm', place: 2, result: '0 / 61,97', prize: '350 PLN' },
      {
        date: '2026-10-10',
        round: 'P 110 cm',
        twoPhase: true,
        place: 4,
        result: '0 / 51,71 · 0 / 35,30',
        prize: '200 PLN',
      },
    ],
  });
});

test('a withdrawn round inside the last show is listed with its result', () => {
  // Without Beckersport and Sielanka, the newest show is 12–13.09: a REZ and a 2nd place.
  const september = startFacts(live.filter((s) => s.date < '2026-10-01')).lastShow;
  assert.deepEqual(
    september.rounds.map((r) => [r.round, r.place, r.result]),
    [
      ['C 130 cm', undefined, 'REZ'],
      ['N 120 cm', 2, '0 / 53,07 · 4 / 37,50'],
    ],
  );
});

test('consecutive shows never merge, even with the same name', () => {
  const show = (id, data, miejsce) => ({
    ...row(data, 'H', 'N', '120', miejsce, 1),
    id_zawodow: id,
    zawody: { nazwa: 'Zawody Regionalne', miejsce: 'Sielanka' },
  });
  const last = startFacts(lotus([show(2, '2026-09-20', '3'), show(1, '2026-09-13', '1')])).lastShow;
  assert.deepEqual(last.rounds, [{ date: '2026-09-20', round: 'N 120 cm', place: 3 }]);
  assert.equal(last.from, '2026-09-20');
});

test('the result: hidden columns and empty values are left out, an unknown column is round one', () => {
  const r = (wyniki, kolumny) =>
    result({ wyniki: JSON.stringify(wyniki), kolumny: JSON.stringify(kolumny) });
  const col = (Id_kolumny, Runda, Ukryta = '0') => ({ Id_kolumny, Runda, Ukryta });
  const v = (Id_kolumny, Wartosc) => ({ Id_kolumny, Wartosc });
  assert.equal(
    r(
      [v('1', '0'), v('2', '61,97'), v('3', 'x')],
      [col('1', '1'), col('2', '1'), col('3', '1', '1')],
    ),
    '0 / 61,97',
  );
  assert.equal(r([v('1', ' ELI'), v('2', '')], [col('1', '1'), col('2', '1')]), 'ELI');
  assert.equal(r([v('9', '4')], []), '4');
  assert.equal(result({}), '');
  assert.throws(() => result({ wyniki: '"REZ"' }));
});

test('one season reads as a sentence, with Polish plural forms', () => {
  assert.deepEqual(startFacts(lotus(sample.slice(0, 7))).starts, {
    pl: '7 startów w sezonie 2026',
    en: '7 starts in the 2026 season',
  });
  const season = (n) => startFacts(lotus(Array(n).fill(sample[1]))).starts;
  assert.deepEqual(season(1), { pl: '1 start w sezonie 2026', en: '1 start in the 2026 season' });
  assert.equal(season(3).pl, '3 starty w sezonie 2026');
  assert.equal(season(12).pl, '12 startów w sezonie 2026');
  assert.equal(season(22).pl, '22 starty w sezonie 2026');
});

test('heights: phases collapse only when equal, a class never repeats it, junk shows none', () => {
  const last = (klasa, height) =>
    startFacts(lotus([row('2026-09-01', 'H', klasa, height, '', 1)])).lastShow.rounds[0].round;
  assert.equal(last('N', '120/130'), 'N 120/130 cm');
  assert.equal(last('L 100', '100'), 'L 100 cm');
  assert.equal(last('N', ''), 'N');
  assert.equal(last('N', '0'), 'N');
  assert.equal(last('N', null), 'N');
});

test('a missing placing is absent, and no finished round is no last show', () => {
  assert.deepEqual(startFacts(lotus([row('2026-09-01', 'H', 'N', '120', '', 1)])).lastShow.rounds, [
    { date: '2026-09-01', round: 'N 120 cm' },
  ]);
  assert.equal(startFacts(lotus([sample[0]])).lastShow, null);
});

test('a row livejumping never promised throws instead of counting', () => {
  assert.throws(() => lotus([row('12.09.2026', 'H', 'N', '120', '2', 1)]));
  assert.throws(() => lotus([row('2026-09-12', 'H', 'N', '120', '2', 'yes')]));
  assert.throws(() => lotus([{ ...row('2026-09-12', 'H', 'N', '120', '2', 1), id_zawodow: null }]));
});

test('the search term stops before the first symbol, which livejumping cannot search', () => {
  assert.equal(searchTerm('LOTUS BLUE B&C'), 'LOTUS BLUE B');
  assert.equal(searchTerm('CASCADA'), 'CASCADA');
  assert.equal(searchTerm('ŻAR 2'), 'ŻAR 2');
});

test('the main bundle is read from its script tag, whatever Angular names it', () => {
  // livejumping.com/ap/ as served on 2026-10-12, and the differential-loading tags before it.
  const now = `<script src="runtime.df8cb15a5244d7ee4fff.js" defer></script>
<script src="polyfills.14df3b9dd0d5d7532dd5.js" defer></script>
<script src="main.7876af2d05848c54ce41.js" defer></script>`;
  const before = `<script src="runtime-es2015.0dae8cbc97194c7caed4.js" type="module"></script>
<script src="main-es2015.1b8d3a1c3e9f0d2b4a6c.js" type="module"></script>`;
  assert.equal(bundleName(now), 'main.7876af2d05848c54ce41.js');
  assert.equal(bundleName(before), 'main-es2015.1b8d3a1c3e9f0d2b4a6c.js');
  assert.equal(bundleName('<script src="runtime.df8cb15a.js"></script>'), undefined);
});
