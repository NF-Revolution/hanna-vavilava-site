import assert from 'node:assert/strict';
import test from 'node:test';
import { rows, searchTerm, startFacts } from '../functions/starts.js';

/*
 * Lotus Blue's 2026 rows as the live API returned them on 2026-09-28 (#122), newest first,
 * plus a decoy and a 2025 start. `wysokosc_p` is a string, two-phase rounds `"120/120"`,
 * and a class can already carry the height (`L 100`).
 */
const row = (data, s_zawodnik, klasa, wysokosc_p, miejsce, ukonczyl, s_kon = 'LOTUS BLUE B&C') => ({
  data,
  s_kon,
  s_zawodnik,
  klasa,
  wysokosc_p,
  miejsce,
  ukonczyl,
});
const sample = [
  { ...row('2026-09-12', 'Hanna Vavilava', 'C', '130/130', '', 0), wyniki: '"REZ"' },
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

test('every start of the exact name counts, and a withdrawal is never the last start', () => {
  const starts = lotus(sample);
  assert.equal(starts.length, 8);
  assert.deepEqual(startFacts(starts), {
    starts: { pl: '8 · 2026: 7 · 2025: 1', en: '8 · 2026: 7 · 2025: 1' },
    lastStart: {
      pl: '12.09.2026 · N 120 cm · 2. miejsce',
      en: '12.09.2026 · N 120 cm · 2nd place',
    },
  });
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
    startFacts(lotus([row('2026-09-01', 'H', klasa, height, '', 1)])).lastStart.pl;
  assert.equal(last('N', '120/130'), '01.09.2026 · N 120/130 cm');
  assert.equal(last('L 100', '100'), '01.09.2026 · L 100 cm');
  assert.equal(last('N', ''), '01.09.2026 · N');
  assert.equal(last('N', '0'), '01.09.2026 · N');
  assert.equal(last('N', null), '01.09.2026 · N');
});

test('ordinals, a missing placing, and no finished round', () => {
  assert.equal(startFacts(lotus([sample[8]])).lastStart.en, '01.06.2025 · L 100 cm · 11th place');
  assert.deepEqual(startFacts(lotus([row('2026-09-01', 'H', 'N', '120', '', 1)])).lastStart, {
    pl: '01.09.2026 · N 120 cm',
    en: '01.09.2026 · N 120 cm',
  });
  assert.equal(startFacts(lotus([sample[0]])).lastStart, null);
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
