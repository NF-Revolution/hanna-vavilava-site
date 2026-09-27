import assert from 'node:assert/strict';
import test from 'node:test';
import { rows, searchTerm, startFacts } from '../functions/starts.js';

/* Lotus Blue's 2026 rows as #108 found them, newest first, plus a decoy and a 2025 start. */
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
  { ...row('2026-09-12', 'Hanna Vavilava', 'C', 130, null, 0), wyniki: '"REZ"' },
  row('2026-09-12', 'Hanna Vavilava', 'N', 120, 2, 1),
  row('2026-09-05', 'Oliwia Wieczorek', 'L', 100, 9, 1),
  row('2026-09-04', 'Hanna Vavilava', 'N', 120, 35, 1),
  row('2026-09-03', 'Hanna Vavilava', 'N', 120, 35, 1),
  row('2026-07-31', 'Hanna Vavilava', 'N', 120, 1, 1),
  row('2026-07-31', 'Hanna Vavilava', 'P', 110, 13, 1),
  row('2026-09-13', 'Someone Else', 'N', 120, 1, 1, 'LOTUS BLUE II'),
  row('2025-06-01', 'Hanna Vavilava', 'L', 100, 11, 1),
];

test('every start of the exact name counts, and a withdrawal is never the last start', () => {
  const starts = rows(sample, 'LOTUS BLUE B&C');
  assert.equal(starts.length, 8);
  assert.deepEqual(startFacts(starts), {
    starts: { pl: '8 · 2026: 7 · 2025: 1', en: '8 · 2026: 7 · 2025: 1' },
    lastStart: {
      pl: '12.09.2026 · N 120 cm · 2. miejsce',
      en: '12 Sep 2026 · N 120 cm · 2nd place',
    },
  });
});

test('ordinals, a missing placing, and no finished round', () => {
  const eleventh = rows([sample[8]], 'LOTUS BLUE B&C');
  assert.equal(startFacts(eleventh).lastStart.en, '1 Jun 2025 · L 100 cm · 11th place');
  const unplaced = rows([row('2026-09-01', 'H', 'N', 120, null, 1)], 'LOTUS BLUE B&C');
  assert.deepEqual(startFacts(unplaced).lastStart, {
    pl: '01.09.2026 · N 120 cm',
    en: '1 Sep 2026 · N 120 cm',
  });
  assert.equal(startFacts(rows([sample[0]], 'LOTUS BLUE B&C')).lastStart, null);
});

test('a row livejumping never promised throws instead of counting', () => {
  assert.throws(() => rows([row('12.09.2026', 'H', 'N', 120, 2, 1)], 'LOTUS BLUE B&C'));
  assert.throws(() => rows([row('2026-09-12', 'H', 'N', 120, 2, 'yes')], 'LOTUS BLUE B&C'));
});

test('the search term stops before the first symbol, which livejumping cannot search', () => {
  assert.equal(searchTerm('LOTUS BLUE B&C'), 'LOTUS BLUE B');
  assert.equal(searchTerm('CASCADA'), 'CASCADA');
  assert.equal(searchTerm('ŻAR 2'), 'ŻAR 2');
});
