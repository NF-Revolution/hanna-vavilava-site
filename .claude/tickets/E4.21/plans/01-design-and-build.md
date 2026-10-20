# #190 E4.21 · Last competition on the horse page — implement

## Context
`Ostatni start` shows one round (`facts.lastStart`, one `{pl,en}` line). Owner wants **Ostatnie zawody / Last competition**: show name, venue, dates, then every round there, stacked in a column. Ticket says design first: 2–3 variants on the canvas, Hanna picks, then build. No blockers in the body; no comments yet.

## Probe result (real API, Lotus Blue 2026) — settles the ticket's open traps
- **`id_zawodow` is a real competition id** — group on it, not on name + dates. Ticket's grouping trap is moot.
- Show: `zawody.nazwa` ("HALOWE ZAWODY REGIONALNE I TOWARZYSKIE - BECKERSPORT"), `zawody.miejsce` ("Beckersport"), `data_od` / `data_do`.
- Round: `konkurs.nazwa` ("22. Konkurs – kl.N, 120 cm - zwykły art. 220.2.1.1"), `klasa`, `wysokosc_p`, `miejsce`, `ukonczyl`, `s_zawodnik`.
- Result: `wyniki` JSON, `Wartosc` per column → `4 / 71,50`, two-phase `0 / 51,71 / 0 / 35,30`; withdrawn `" ELI"`, `" REZ"`.
- Prize: `nagroda` ("350", "" when none), currency `waluta` ("PLN").
- Other riders appear (Oliwia Wieczorek, THE ONE 05.09).
- Owner rule (asked now): **last competition = newest show with ≥1 finished round**; its ELI/REZ rounds still listed. Matches today's "last start" rule.

## Boards (artboard-reader)
`HorseDetail.dc.html` (1440) + `MobileDetail.dc.html` (390). Fakty: two-column `dl`, left col rows 5–6 = Ostatni start, Liczba startów (+ livejumping link); mobile one column. Desktop sub-bar also draws "Ostatni start 6.09.2026 · 32 000 EUR" — code already shows price only (E4.20), board is stale there. Reusable list look: mobile "Pozostałe konie" rows (1px `#D8D6D0` top rule, 14px pad, 13px label, meta line). Tokens: ink `#0E0E0D`, hairline `#D8D6D0`, meta `#6B6A64`, `.lbl` 10px/0.24em, `.meta` 11px/0.16em.

## Phase 1 — design (stop for owner pick)
1. `gh issue develop 190 --base main --checkout`. Ticket notes: `.claude/tickets/E4.21/` with `INDEX.md`, `plans/01-design-and-build.md` (this plan), `followup.md`.
2. Approach comment on #190 (§5): boards, probe fields, approach, rejected options.
3. Canvas, per `artboards` skill: plain `read` of canvas URL first (memory), then `canvas.json` + both detail boards. Add three variant boards, each one section at desktop 1440 + mobile 390 side by side, real Beckersport data (3 rounds: 11th N 120 `4 / 71,50`; 2nd P 110 `0 / 61,97` 350 PLN; 4th P 110 two-phase `0 / 51,71 / 0 / 35,30` 200 PLN):
   - **A · In the table** — Fakty row "Ostatnie zawody": show line, then rounds as stacked sub-lines. Row moved to span both columns at the table's foot, so it stretches no partner row.
   - **B · Own section** — "Ostatnie zawody" block after Fakty: show name/venue/dates header, rounds as hairline rows (Pozostałe konie look): big placing numeral · class + height · faults/time · prize.
   - **C · Ledger** — compact results table (Miejsce | Konkurs | Wynik | Nagroda) under Fakty; on mobile each round collapses to a stacked card.
   One publish, `canvas.json` included (boards added). Comment on #190 with canvas link + "pick A/B/C". **Stop.**

## Phase 2 — build (after pick)
- `functions/starts.js`: `rows()` also keeps `show` (`id_zawodow`), `showName`, `venue`, `from`/`to`, `round` (`konkurs.nazwa` or klasa+height), `result` (`wyniki` joined ` / `, trimmed), `prize`, `rider` — only fields the picked variant draws. `startFacts()` returns `lastShow` (language-neutral object: show + rounds newest first) in place of `lastStart`; reuse its existing height/klasa dedupe. Fail-soft unchanged (throws keep stored value).
- `functions/index.js` `syncStarts()`: field list `['starts','lastShow']`; change compare via `JSON.stringify`; change-log text = show name + round count.
- `src/horse.ts`: `facts.lastShow` zod object nullable, `lastStart` deleted. Live RTDB rewritten in place by next sync, no shim (memory: no migrations before launch).
- `src/pages/admin.astro`: `synced` list, Save-preserve (~l.811), refresh `Change` type.
- `src/components/HorseDetail.astro`: drop `lastStart` row; render picked variant; empty → `d.infoOnRequest`. Dates `dd.mm.yyyy`, range `10–11.10.2026`. PL/EN place wording reuse `ordinal`-style rule — move formatting into the component with strings from i18n.
- `src/i18n/pl.json` + `en.json`: `lastShow` label + round labels; remove `lastStart` keys (both `rows` and admin `facts.lastStart`).
- Boards: chosen variant into `HorseDetail` + `MobileDetail`; remove sub-bar "Ostatni start"; delete the other two variant boards.
- Tests `tests/starts.test.mjs`: fixture from the real Beckersport response (3 rounds, 2 days), consecutive shows, ELI-only newest show skipped, ELI round inside chosen show kept. Update `tests/horse.test.mjs` facts list.

## Verification
- `npm test` (emulators) — starts tests green.
- `npm run ci`.
- `npm run dev`, open Lotus Blue PL + EN page at 1440 and 390: list matches board; horse without `livejumpingName` shows "Informacja na zapytanie".
- Admin "Odśwież starty" against emulator shows the change line.
- `ticket-reviewer`, then `create-pr`, outcome comment, finalize ticket notes.
