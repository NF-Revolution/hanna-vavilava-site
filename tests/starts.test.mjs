import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { bundleName, result, rows, searchTerm, startFacts } from '../functions/starts.js';

/*
 * Lotus Blue's 2026 rows as the live API returned them on 2026-09-28 (#122), newest first,
 * plus a decoy and a 2025 start. `wysokosc_p` is a string, two-phase rounds `"120/120"`,
 * and a class can already carry the height (`L 100`). Every row here is a clean round
 * unless `faults` says otherwise.
 */
const row = (data, s_zawodnik, klasa, wysokosc_p, miejsce, ukonczyl, s_kon = 'LOTUS BLUE B&C') => ({
  data,
  s_kon,
  s_zawodnik,
  klasa,
  wysokosc_p,
  miejsce,
  ukonczyl,
  wyniki: JSON.stringify([{ Wartosc: '0' }]),
});
const faults = (r, ...values) => ({
  ...r,
  wyniki: JSON.stringify(values.map((Wartosc) => ({ Wartosc }))),
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

test('example results: only the clean rounds of the top level the horse jumped clean', () => {
  // C 130 (12.09) is a REZ, N 120 on 12.09 had 4 in phase II and 11.10 had 4: one clean N is left.
  assert.deepEqual(startFacts(live).cleanRounds, [
    {
      date: '2026-07-31',
      venue: 'Beckersport',
      round: 'N 120 cm',
      place: 1,
      result: '0 / 70,78',
      prize: '600 PLN',
    },
  ]);
  // Without it the top clean level is 110, and the 13th place P 110 on 31.07 had 8 faults.
  assert.deepEqual(
    startFacts(live.filter((s) => s.date !== '2026-07-31')).cleanRounds.map((r) => [
      r.date,
      r.round,
      r.twoPhase,
      r.result,
    ]),
    [
      ['2026-10-11', 'P 110 cm', undefined, '0 / 61,97'],
      ['2026-10-10', 'P 110 cm', true, '0 / 51,71 · 0 / 35,30'],
    ],
  );
});

test('example results: at most three, newest first, an older higher level beats a newer lower', () => {
  const dates = ['2026-09-01', '2026-09-08', '2026-09-15', '2026-09-22'];
  const n120 = dates.map((d) => row(d, 'H', 'N', '120', '1', 1));
  assert.deepEqual(
    startFacts(lotus(n120)).cleanRounds.map((r) => r.date),
    ['2026-09-22', '2026-09-15', '2026-09-08'],
  );
  const older130 = row('2025-05-01', 'H', 'C', '130', '', 1);
  assert.deepEqual(startFacts(lotus([...n120, older130])).cleanRounds, [
    { date: '2025-05-01', venue: '', round: 'C 130 cm', result: '0' },
  ]);
  // The higher phase is the level: 120/130 outranks a clean 125.
  assert.equal(
    startFacts(
      lotus([
        row('2026-09-01', 'H', 'N', '125', '', 1),
        row('2026-08-01', 'H', 'C', '120/130', '', 1),
      ]),
    ).cleanRounds[0].round,
    'C 120/130 cm',
  );
});

test('example results: a fault anywhere, an elimination or an unfinished round is not clean', () => {
  const n = (...r) =>
    startFacts(lotus([faults(row('2026-09-01', 'H', 'N', '120', '1', 1), ...r)])).cleanRounds;
  assert.equal(n('4', '71,50'), null);
  assert.equal(n(' ELI', ''), null);
  assert.equal(n('', ''), null);
  assert.equal(n('0,25', '80,10'), null);
  assert.deepEqual(n('0,00', '80,10')[0].result, '0,00 / 80,10');
  assert.equal(startFacts(lotus([row('2026-09-01', 'H', 'N', '120', '', 0)])).cleanRounds, null);
  // Two phases, one column each: a fault in phase II spoils the round.
  const phases = (a, b) => ({
    ...row('2026-09-01', 'H', 'N', '120/120', '2', 1),
    wyniki: JSON.stringify([
      { Id_kolumny: '1', Wartosc: a },
      { Id_kolumny: '2', Wartosc: b },
    ]),
    kolumny: JSON.stringify([
      { Id_kolumny: '1', Runda: '1' },
      { Id_kolumny: '2', Runda: '2' },
    ]),
  });
  assert.equal(startFacts(lotus([phases('0', '4')])).cleanRounds, null);
  assert.equal(startFacts(lotus([phases('0', '0')])).cleanRounds[0].result, '0 · 0');
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
    startFacts(lotus([row('2026-09-01', 'H', klasa, height, '', 1)])).cleanRounds[0].round;
  assert.equal(last('N', '120/130'), 'N 120/130 cm');
  assert.equal(last('L 100', '100'), 'L 100 cm');
  assert.equal(last('N', ''), 'N');
  assert.equal(last('N', '0'), 'N');
  assert.equal(last('N', null), 'N');
});

test('a missing placing is absent, and no clean round is no example results', () => {
  assert.deepEqual(startFacts(lotus([row('2026-09-01', 'H', 'N', '120', '', 1)])).cleanRounds, [
    { date: '2026-09-01', venue: '', round: 'N 120 cm', result: '0' },
  ]);
  assert.equal(startFacts(lotus([sample[0]])).cleanRounds, null);
});

test('a row livejumping never promised throws instead of counting', () => {
  assert.throws(() => lotus([row('12.09.2026', 'H', 'N', '120', '2', 1)]));
  assert.throws(() => lotus([row('2026-09-12', 'H', 'N', '120', '2', 'yes')]));
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
