# E4.21 — followup

Shipped 2026-10-20 — see the last `## Outcome` at the bottom.

Issue [#190](https://github.com/NF-Revolution/hanna-vavilava-site/issues/190) ·
branch `190-e421-last-competition-on-the-horse-page-every-round-stacked` · canvas `F7qeoBwkyu2Dau5p1iLg2n`

## 2026-10-20

- probed livejumping for Lotus Blue 2026. `id_zawodow` is a real competition id, so rounds
  group on it, not on name + dates. Show: `zawody.nazwa`, `zawody.miejsce`, `data_od`/`data_do`.
  Round: `konkurs.nazwa`, `wyniki` (JSON, `Wartosc` per column), `nagroda` + `waluta`.
- owner rule: last competition = newest show with at least one finished round; ELI/REZ
  rounds inside it are still listed.
- board sub-bar on `HorseDetail` still draws "Ostatni start"; code shows price only since E4.20.
- next: three variant boards on the canvas, then stop for the owner's pick.
- canvas version 73: variant boards `LastShowA/B/C.dc.html` at x 6080–11970, y 9900, title note `t4`.
  Pick requested on #190. Build waits for it. After the pick: chosen variant into
  `HorseDetail` + `MobileDetail` (drop sub-bar "Ostatni start"), delete the other boards and `t4`.
- owner picked **A** ("I think A is the best"), recorded on #190.
- built: `facts.lastStart` (one `{pl,en}` line) replaced by `facts.lastShow`, a language-neutral
  object — show name, venue, from/to, rounds newest first — worded by `HorseDetail.astro`.
  Result string from `wyniki` grouped by `kolumny[].Runda`. Range via `Intl.DateTimeFormat#formatRange`,
  EN ordinals via `Intl.PluralRules({type:'ordinal'})`. Sync compares with `isDeepStrictEqual`,
  because the database returns keys in its own order and drops absent keys.
- trap: headless Chrome will not render narrower than ~500 px; a 390 screenshot needs a 390 px iframe.
- trap: `astro preview` 404s on the static paths here; serve `dist` with `python3 -m http.server`.
- canvas version 74: variant A drawn into `HorseDetail` (6340) and `MobileDetail` (6360), desktop
  sub-bar loses "Ostatni start", `LastShowA/B/C` and note `t4` removed.
- next: reviewer verdict, PR, finalize.
- reviewer (fresh eyes): two highs, both fixed. (1) the five fixed round columns overflowed the
  page from 721 to ~1180 px; rounds now stack below 1200 px. (2) schema defaults on `twoPhase` /
  `result` made a panel Save rewrite `lastShow`, so the next refresh logged a phantom change; the
  round fields are now `.optional()` with no defaults, and `tests/horse.test.mjs` checks the round-trip.

## What was built — 2026-10-20

- Design first: three variant boards (A in the table, B own section, C results table) on canvas
  v73 with real Beckersport data; the owner picked A; v74 drew A into `HorseDetail` and
  `MobileDetail` and removed the variant boards.
- `functions/starts.js`: `rows()` keeps the show (`id_zawodow`, `zawody.nazwa`, `zawody.miejsce`,
  `data_od`/`data_do`), `result()` from `wyniki` grouped by `kolumny[].Runda`, prize from
  `nagroda` + `waluta`. `startFacts()` returns `lastShow` in place of `lastStart`.
- `functions/index.js`: sync writes `starts` + `lastShow`, compares with `isDeepStrictEqual`.
- `src/horse.ts`, `src/pages/admin.astro`, `src/i18n/*.json`: the new field everywhere `lastStart` was.
- `src/components/HorseDetail.astro`: one full-width row under the facts table; `formatDateRange`
  and `ordinal` in `src/i18n/format.ts` (both `Intl`).
- `tests/livejumping-lotus-2026.json`: Lotus Blue's real 2026 rows, trimmed, for the grouping tests.

## Outcome — 2026-10-20

- Approach: language-neutral `lastShow` object worded by the page; grouping on the real show id.
- Owner rule: last show = newest show with a finished round; ELI/REZ rounds inside it are listed.
- Traps: headless Chrome will not lay out narrower than ~500 px (use a 390 px iframe); `astro
preview` 404s on these paths (serve `dist` with `python3 -m http.server`); RTDB drops absent keys
  and returns its own key order, so any schema default on a synced field becomes a phantom change.
- Rejected: pre-formatted `{pl,en}` text with line breaks; grouping on name + dates.
