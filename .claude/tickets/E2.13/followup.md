# E2.13 — followup

Issue #122. Shipped 2026-09-28 — see the last `## Outcome` at the bottom.

## 2026-09-28

- owner screenshot: Lotus Blue `12.09.2026 · N · 2. miejsce` (no height), `7 · 2026: 7`
- live probe of the search API (curl bundle → key → POST `LOTUS BLUE B`, 2026) allowed this time; 7 rows, `last_page` 1
- root cause: `wysokosc_p` is a string, `"120/120"` on two-phase rounds → `Number()` = `NaN` → height `null`. E2.12 fixture used numbers, so the tests passed on data the API never sends
- live `klasa` can already carry the height: `"L 100"` with `wysokosc_p` `"100"`
- boards (HorseDetail, MobileDetail) drew only the multi-season example `31 · 2026: 12 · 2025: 11 · 2024: 8`
  next: none — shipped.

## What was built — 2026-09-28

**Problem:** last start dropped the barrier height; a first-season count repeated one number twice.

**Steps:**

1. `functions/starts.js` `rows()`: `height` is a string — accepts `^[1-9]\d*(\/[1-9]\d*)*$`, equal phases collapse (`120/120` → `120`), unequal stay (`120/130`), anything else `null`
2. `startFacts()`: class ending with the height is trimmed (`L 100` + `100` → `L 100 cm`); one season → PL `7 startów w sezonie 2026` (`Intl.PluralRules('pl')` one/few/many → start/starty/startów), EN `7 starts in the 2026 season`; several seasons unchanged
3. `tests/starts.test.mjs`: fixture in live API types; plural 1/3/7/12/22; `120/130`; junk heights
4. canvas: Starts row single-season state on `HorseDetail` + `MobileDetail`

## Outcome — 2026-09-28

**Approach:** fix in the stored text at sync time — the page renders `facts.*` verbatim, so no page, i18n or schema change.
**Bugs met:** the E2.12 fixture guessed numeric heights from #108; always build fixtures from a live response.
**Rejected:** `parseInt` (turns `120/130` into `120`, hides a real two-height round); moving the wording to `pl.json`/`en.json` (the other synced strings, `miejsce`/`place`, live in `starts.js` and the page never formats facts).
**Traps for next time:** nothing changes live until `functions` is deployed and "Odśwież starty" + Publish run; a horse's first season flips to the `N · YYYY: n` line on its first start of the next year.
**Files that mattered:** `functions/starts.js`, `tests/starts.test.mjs`
