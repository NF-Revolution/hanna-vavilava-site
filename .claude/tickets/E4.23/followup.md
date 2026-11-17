# E4.23 · Example results entered by hand, each with its livejumping link

Status: shipped at the pull request 2026-11-17 · #197 · decided on #196

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
- Trap: `horseSchema` is a `strictObject`. Stored `livejumpingName` (lotus-blue, red-bull on
  2026-11-17) fails the build parse, so it must be removed from the database before this
  ships; the old schema defaults it, so removing it early is safe. `facts.starts` is in a
  plain `z.object` and is stripped, but remove it too.
- Rejected: filling fields from the link with a Function (gated API, against their bot
  policy; auto mode also refused reading their bundle), parsing copied page text (fragile),
  a manual starts-count field (nobody keeps it current).
- Post-merge: `functions:delete refreshStarts startsWeekly`. Hanna adds rounds, Save, Publish.
