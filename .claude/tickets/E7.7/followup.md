# E7.7 · Enquiry retention purge — follow-up

Shipped 2026-10-05 — #142

## 2026-10-05 — started

Plan approved. No blockers, no comments on the issue. The admin panel has no artboard (E2.3),
so no board read and no canvas change. Approach comment posted on #142.

## What was built — 2026-10-05

- `expired(all, now)` in `functions/enquiry.js`: one `update()` object for `/enquiries`.
  `handled` + `handledAt` older than six calendar months → `null`; `sale: true` → skipped;
  `handled` with no `handledAt` (ticked before E7.7) → `handledAt` stamped with now, so its
  clock starts instead of never. Tested in `tests/enquiry.test.mjs`.
- The daily 04:00 job `subscribersCleanup` is renamed `retention` and runs both cleanups, so
  there are still three Cloud Scheduler jobs (the free tier). `monitoring/errors.policy.json`
  names `retention`.
- Inbox (`/admin/zapytania`): ticking handled writes `handled` + `handledAt`
  (`serverTimestamp()`) in one `update()`, and unticking nulls both. A second checkbox,
  `admin.sale`, toggles `sale`. Both are kept out of the raw `<dl>`. A link at the top goes
  to `/admin/poradnik#zapytania`.
- `/admin/poradnik#zapytania`: the monthly routine. Delete `formularz@` mail and the
  Telegram notifications older than **5** months. Sale enquiries stay in the database and
  are deleted by hand five years after the tax year ends.
- The privacy notice is unchanged. It still matches: the database copy goes six months after
  handling, the other copies earlier, and a sale is kept.

## Outcome — 2026-10-05

`npm run ci` green, `npm test` 70/70. The review found one high: the error policy still
filtered on `subscriberscleanup`. That is fixed, and the header comment now has the
`policies update` command.

Traps:

- Renaming a scheduled Function does not delete the old one. After deploying `retention`, run
  the `functions:delete subscribersCleanup` and `gcloud monitoring policies update` from the
  `functions/index.js` header, or the old job keeps running.
- A monthly routine at six months lets a copy live for seven. Hence five.
- The names `retention` and `purge` were both taken (the job, and a local in the R2 code), so
  the rule is named `expired`.
