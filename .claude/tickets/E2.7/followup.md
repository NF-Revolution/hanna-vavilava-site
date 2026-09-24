# E2.7 · Admin enquiry inbox — #22

Shipped 2026-09-24.

## 2026-09-24

- Branch `22-e27-admin-enquiry-inbox`. Approach comment posted on #22, and the storage contract noted on #42.
- Built: an inbox section in `/admin`, three `admin.*` strings in both locales, two rules-test rows,
  and a decision-log entry. #22 had no checklist, so one was added and ticked.
- `npm run ci` green, `npm test` 29/29. ticket-reviewer: clear.

## What was built — 2026-09-24

### Context

#22: "List enquiries and mark them handled, so she is not dependent on Telegram history alone."
Blocker #18 closed. No comments on the issue. No enquiry is written yet: E5.3 (#42) writes
`/enquiries` from a Function, E5.1 (#40) owns the 8 form fields. Rules already allow the admin
to read and write `/enquiries`. The admin panel has no artboard, by decision (E2.3), so no
artboard read and no canvas change.

Main problem: the enquiry shape does not exist yet. Plan: do not guess the 8 fields. The inbox
renders whatever fields a record holds. The only contract with E5.3 is two keys:
`createdAt` (ms, `ServerValue.TIMESTAMP`) and `handled` (panel-owned, `true` or absent).

### Approach

All in `src/pages/admin.astro` plus strings, one test row, notes.

1. **Markup**: new `<section>` at top of `#list-view` (hides with it while the editor is open):
   `<h2>Zapytania</h2>`, `<ol id="enquiries">`, empty text, `role="alert"` error line. Plus a
   `<template id="enquiry-row">`: `<time data-when>`, a `<label><input type="checkbox" data-handled> Załatwione</label>`,
   and `<dl>`.
2. **Script**:
   - A second `onValue(ref(db, 'enquiries'))` next to the horses one. `unsubscribe` becomes
     one function that closes both.
   - `renderEnquiries()`: newest first by `createdAt ?? 0`. For each field except `createdAt`/`handled`: `dt` = key,
     `dd` = string value (`JSON.stringify` for non-strings). **`textContent` only**, never
     `innerHTML` — the values are anonymous public input.
   - Date: `toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })`.
   - Checkbox `aria-label` = `Załatwione: <date>`, same pattern as `Edytuj: <name>`.
   - Change → `set(ref(db, 'enquiries/<id>/handled'), checked || null)`. On failure: flip the box
     back and show `saveFailed`.
   - The order never depends on `handled`, so a row stays where it is when it is toggled.
     A re-render keeps focus: remember the focused row id, then focus it again.
   - Handled rows are muted with CSS `li:has(:checked)`.
3. **i18n** (`pl.json` + `en.json`, in `admin`): `enquiries`, `enquiriesEmpty`, `handled`.
4. **Test**: `tests/rules.test.mjs` gets two rows. `admin marks an enquiry handled` (PUT
   `enquiries/x/handled` 200) and `non-admin write to /enquiries fails` (401).
5. **`ponytail:` comments**:
   - Keys are shown raw until E5.1 fixes the field set. Polish labels for them are the upgrade.
   - The whole `/enquiries` tree is subscribed. Fine up to a few thousand records.
     `orderByChild('createdAt')` + `limitToLast` + `.indexOn` is the upgrade.
6. **Contract recorded in two places**:
   - In the decision log `.claude/tickets/INDEX.md`, with a new E2.7 row.
   - As a note on #42 (via `ticket` skill): E5.3 writes `createdAt` and plain field values;
     `handled` belongs to the panel.

Skipped: delete/retention (a privacy decision, not this ticket), filters, tel:/mailto links,
an enquiry zod schema (E5.3 owns it).

### Process (ticket-implement)

- Create `.claude/tickets/E2.7/` (`INDEX.md`, `plans/01-inbox.md`, `followup.md`) after approval.
- Branch: `gh issue develop 22 --base main --checkout`. Post one approach comment on #22.
- Build, then run `npm run ci` + `npm test`. Next, `ticket-reviewer`, then `create-pr`, then finalize the notes
  folder in the same PR, then post the outcome comment.

### Verification

- `npm run ci` green (format, types, build, links, a11y).
- `npm test`: the new rules rows pass.
- Manual check: `npm run dev`, sign in at `/admin`, see the inbox. A real enquiry needs one record in production.
  With your OK, I push one fake enquiry with `npx firebase-tools@15 database:push /enquiries`,
  toggle it, then delete it. Otherwise you check it on the PR preview channel.

## Outcome — 2026-09-24

- Shipped as planned. The approach is on #22 and the storage contract is on #42.
- Not checked in a browser against real data: no enquiry exists until E5.3, and the panel talks to
  production. The first real enquiry, or one pushed by hand, is the manual check.
- Rejected: an enquiry zod schema ahead of E5.1/E5.3, sorting handled rows last, delete and
  retention, and `limitToLast` paging.
- Traps for next time:
  - The list re-renders on every database change, so the focused checkbox is found again by
    `data-id` through `CSS.escape`. A key may hold characters a selector does not accept.
  - Unticking writes `null`, which deletes `handled`. `false` would leave a key nobody reads.
  - E5.3 must not write `handled`, or a new enquiry arrives already marked as dealt with.
