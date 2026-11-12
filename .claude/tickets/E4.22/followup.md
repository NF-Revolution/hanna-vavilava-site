# E4.22 — followup

Shipped 2026-11-12 — see the last `## Outcome` at the bottom.

Issue [#194](https://github.com/NF-Revolution/hanna-vavilava-site/issues/194) ·
branch `194-e422-example-results-clean-rounds-from-the-top-level` · canvas `F7qeoBwkyu2Dau5p1iLg2n`

## 2026-11-12

- owner rules (2026-11-11): clean = 0 faults every round/phase; level = height; single top level, newest first, max 3; all seasons; none → row hidden.
- issue #194 filed, approach comment posted, plan 01 copied.
- built: `isClean` + `level` in `functions/starts.js`, `facts.cleanRounds` through schema, sync, admin, i18n, page;
  dead show grouping (`id_zawodow`, show name, `data_od`/`data_do`, `formatDateRange`) deleted. Real Lotus data → one
  round, 31.07 N 120 (C 130 REZ; 12.09 N 120 two-phase had 4 in phase II).
- `npm test` 77/77, `npm run ci` green. Screens at 1440 and 390: venue under date, rules only between rounds.
- canvas version 76: `HorseDetail` + `MobileDetail` row redrawn ("Przykładowe wyniki", two clean P 110 rounds).
- trap: a screenshot wrapper page needs `<meta charset=utf-8>`, or a Polish search string in its script never matches.
- trap: the hero is 100vh, so a tall iframe grows the hero instead of showing the page; scroll inside a 650 px iframe.
- reviewer (fresh eyes): clear. Only open item was the PR body's post-merge steps.

## What was built — 2026-11-12

- `functions/starts.js`: `isClean` (finished, first value of every round/phase matches `^0(,0+)?$`) and `level`
  (max height, none = 0); `startFacts()` returns `cleanRounds`: the top level's clean rounds, newest first,
  `slice(0, 3)`, `null` when none. `rows()` lost `show`, `showName`, `from`, `to` and the `id_zawodow` check.
- `functions/index.js`: sync field `cleanRounds`, change-list summary `<round> · <count>`.
- `src/horse.ts`, `src/pages/admin.astro`, `src/i18n/*.json`: the new field everywhere `lastShow` was;
  label "Przykładowe wyniki" / "Example results".
- `src/components/HorseDetail.astro`: row only when `cleanRounds`; show header gone; venue a muted line under
  the date; rules only between rounds. `formatDateRange` deleted from `src/i18n/format.ts`.
- `src/fixture.json`, `tests/starts.test.mjs`, `tests/horse.test.mjs`: new shape and rules.
- Canvas v76: `HorseDetail` and `MobileDetail` rows redrawn.

## Outcome — 2026-11-12

- Approach: rule in `startFacts()` at sync time (starts are never stored); level = obstacle height.
- Owner rules (#194): clean in every phase; single top level only, no fill from lower levels; max 3; all
  seasons; none hides the row.
- Rejected: class-letter ranking (named classes do not parse); `[]` for none (RTDB drops it → phantom change).
- Limit: a points class where 0 means no points reads as clean (`ponytail:` in `starts.js`).
- Traps: Functions deploy by hand before "Odśwież starty"; stale `facts/lastShow` is stripped by the parse but
  stays in RTDB until removed; screenshot wrapper needs `<meta charset=utf-8>`; the 100vh hero grows in a tall iframe.
