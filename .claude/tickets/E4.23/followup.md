# E4.23 · Example results entered by hand, each with its livejumping link

Status: shipped at the pull request 2026-11-17 · #197 · decided on #196

## 2026-11-17 — correction after the owner's review

The first push removed the "Wyniki na livejumping ↗" name-search link with the starts row it
sat on, and `livejumpingName` with it. The owner: "It should have stayed". Restored:
`livejumpingName` (schema, panel field, hint now "empty = no link"), `livejumpingHref`, and the
link under the example results. The row now shows when there are rounds or a name. Canvas v80.
Side effect: the stored `livejumpingName` parses again, so no database cleanup is needed
before merge. Lesson: dropping a row is not dropping what hangs off it; a visible element the
owner did not name gets asked about, not removed.

## What was built — 2026-11-17

livejumping put its API behind a Cloudflare Turnstile gate, so the starts sync only got 422s.
The owner decided (#196): no sync at all, Hanna types up to three rounds in the panel, each
with its livejumping competition link, and the starts-count row goes.

- Functions: `functions/starts.js`, `refreshStarts`, `startsWeekly` and their tests deleted.
- Schema (`src/horse.ts`): `livejumpingName` and `facts.starts` removed. `facts.cleanRounds`
  items are `{ url, date, venue, round, place?, result, prize? }`, max 3, `url` https only,
  `date` `YYYY-MM-DD`. `twoPhase` is gone: the height is typed as livejumping prints it
  (`P 110/110 cm`).
- Admin: field kind `rounds`, three fixed slots named `facts.cleanRounds.<i>.<key>`;
  `fromFields` drops all-empty slots and an empty prize, none left is `null`. Refresh button,
  its script and the save carry-over are gone.
- Horse page: starts row removed; each round's result is a link to its source, new tab,
  with the screen-reader note. `livejumpingHref` removed from `src/site.ts`.
- Canvas v78: `HorseDetail` and `MobileDetail` drop "Liczba startów" and link each result;
  on the desktop "Dla kogo" moves to the left column's fifth row, the dark top rule to
  "Lokalizacja".

## Outcome — 2026-11-17

- Tests 67/67, `npm run ci` green. Reviewer: clear; its `javascript:` URL note fixed (https only).
- Trap: `horseSchema` is a `strictObject`; a top-level key it lost fails the build parse.
  `facts.starts` sits in a plain `z.object` and is stripped, so removing it is tidy only.
- Rejected: filling fields from the link with a Function (gated API, against their bot
  policy; auto mode also refused reading their bundle), parsing copied page text (fragile),
  a manual starts-count field (nobody keeps it current).
- Post-merge: `functions:delete refreshStarts startsWeekly`. Hanna adds rounds, Save, Publish.
