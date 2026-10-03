# E7.2 · English pass (#58)

Finalized 2026-10-03

## What was built — 2026-10-03

- The diff covered the three EN boards that exist: `EN-Opening`, `EN-Horse` and `EN-Enquiry`, all at 1440.
  There is no EN mobile board and no admin board.
- `en.json` copy changes:
  - `home.videoSpec` now says "no text across the frame";
  - `home.videoAlt` now says "jumping a 125 cm oxer";
  - `pages.horses.more` is now "Full details".
- The `pages.enquiry.description` meta text in both dictionaries now fills `{hours}` from `site.responseWindow`
  (`EnquiryPage.astro`). The EN version had hardcoded `08:00–21:00`, and that disagreed with `/site`.
- `formatDate` uses one format for both locales, `19.09.2026`. The starts sync (`functions/starts.js`) writes
  its EN `lastStart` in the same format.
- `formatPrice` uses `currencyDisplay: 'code'`, so prices read `EUR 32,000` / `32 000 EUR`. That removes the logged
  E4.2 price deviation. The owner chose both formats.
- The admin editor has a new check, `halfPairs` in `src/horse-form.ts`. Save refuses a PL/EN pair that has one half blank,
  lists the paths of the blank halves under `admin.pairHalf`, and focuses the first one. It is a check in the editor
  only, not a schema rule. There is a test for it in `tests/horse.test.mjs`.

## Outcome — 2026-10-03

Shipped as planned. `npm run ci` is green and `ticket-reviewer` gave `Verdict: clear`.

Rejected:

- the board's longer aria-label on the homepage overlay, because the visible label is the better accessible name;
- "between 08:00 and 21:00", because `responseWindow` is one value for both languages;
- translating the Telegram message and the email, because they go to Hanna only;
- the privacy stub, because it belongs to #59.

Traps:

- `startsWeekly` and `refreshStarts` must be redeployed before `lastStart` dates in the DB switch from
  `12 Sep 2026` to `12.09.2026`. A value already stored stays in the old format until the next sync.
- `halfPairs` focuses only fields that have a `name`. A half-blank photo alt or X-ray label is still listed
  but gets no focus.
- If the DB is clean, `halfPairs` can move into `horseSchema` as a refine. Until then, a refine would fail the build.
