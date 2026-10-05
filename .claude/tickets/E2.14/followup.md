# E2.14 · Move the enquiry inbox to its own admin page — #158

Shipped 2026-10-05.

## 2026-10-05

- Branch `158-e214-move-the-enquiry-inbox-to-its-own-admin-page`. The approach comment is on #158.
- `npm run ci` green, and `npm test` passes 69/69. A fresh worktree first needs `npm ci --prefix functions`.
  Without it, the Functions tests fail on `Cannot find module 'firebase-functions'`.
- ticket-reviewer: clear, every AC met.

## What was built — 2026-10-05

### Context

`/admin` renders every enquiry inline (E2.7). The list grows and pushes the horse editor down.
Move the full list to `/admin/zapytania`, next to `/admin/poradnik`. `/admin` keeps a live count
of unhandled enquiries and a link. The ticket names one trap: the count and the list must read the
same `handled` flag (`true` or absent), so a missing flag counts as unhandled.

- No comments on #158. No `**Blocked by**` in the body, so no blockers.
- The admin panel has no artboard, by decision (E2.3). No board read and no canvas change, same as E2.7.

### Approach

1. **`src/enquiry.ts`** (new, one export): `isHandled = (e) => e.handled === true`. The list's
   checkbox and the count both import it, so they cannot drift.
2. **`src/pages/admin/zapytania.astro`** (new). Standalone like `poradnik.astro`: noindex, not in
   `routes.ts`. `firebase.json`'s `/admin{,/**}` header covers it already.
   - Markup: skip link, `<a href="/admin">` back link, `h1 {a.enquiries}`, and a `<section hidden>`
     that holds `#enquiries`, the empty text, the error line and the `enquiry-row` template. All of
     it moves verbatim from `admin.astro`.
   - Script: Firebase init, then `onAuthStateChanged`. If signed out or the user has no admin claim,
     the page runs `location.replace('/admin')`, which shows the sign-in or no-access view. Otherwise
     it subscribes `onValue('enquiries')` and calls `renderEnquiries()`, moved unchanged: newest
     first, Warsaw time, toggle writes `true || null`, CSS.escape focus restore, `textContent` only.
     The section un-hides only after the claim check. A sign-out in another tab fires the listener,
     which unsubscribes and redirects.
   - `ponytail:` the redirect drops a deep link: after sign-in she lands on `/admin`, one click
     from the inbox. A shared sign-in gate for both pages is the upgrade.
   - Styles: the `#enquiries` rules move here, plus the few base rules they need: `main`, `ol`,
     `li` flex, `label` grid, input `min-height`, `:empty`.
3. **`src/pages/admin.astro`**: delete the list, the template, `renderEnquiries` and the
   `#enquiries` CSS. The section at the top of `#list-view` becomes `h2 Zapytania`,
   `<p id="enquiry-count" role="status">` and `<a href="/admin/zapytania">`. The same
   `onValue('enquiries')` stays and sets the count:
   `n ? plural('pl', admin.enquiriesWaiting, n) : admin.enquiriesNone`. It reuses `plural()` from
   `src/i18n/format.ts`. Zero gets its own sentence, never "0 …". Update the header comment.
   The href is hardcoded like the existing `/admin/poradnik` links; admin pages are not in `routes.ts`.
4. **i18n** (`admin`, both files, same shape):
   - `enquiriesWaiting` as `{one, few, many, other}`. pl: "1 nowe zapytanie" / "nowe zapytania" /
     "nowych zapytań". en uses "enquiry"/"enquiries".
   - `enquiriesNone`: "Brak nowych zapytań." / "No new enquiries."
   - `enquiriesOpen`: "Otwórz zapytania" / "Open enquiries".
   - `backToPanel`: "← Panel" / "← Admin".
   - The page title is `{a.enquiries} — {a.title}`, so it needs no new key.
5. **Decision log** `.claude/tickets/INDEX.md`: an E2.14 row noting the inbox has moved and that a
   signed-out visit redirects.

Skipped:

- a shared auth gate or layout (the redirect covers the AC);
- an `equalTo(null)` query with `.indexOn` for the count (the whole tree is already read, and the existing ponytail covers it);
- rules changes (none needed).

### Process

- Approval → `gh issue develop 158 --base main --checkout`. Create `.claude/tickets/E2.14/` (INDEX,
  plans/01, followup). Post one approach comment on #158.
- Build → `npm ci` if needed → `npm run ci` + `npm test` → tick ACs → `ticket-reviewer` → `create-pr`
  → finalize notes in the same PR → outcome comment.

### Verification

- `npm run ci` green (format, types, build, links, a11y), `npm test` green.
- `npm run dev`:
  - signed out, open `/admin/zapytania`: it redirects to the `/admin` sign-in, and no enquiry data
    is requested;
  - signed in, `/admin` shows the count and the link;
  - `/admin/zapytania` lists the enquiries and toggles them;
  - with both pages open, ticking one updates the count live.
- Real data lives in production, so a live toggle check needs your OK, or the PR preview channel.
  E2.7 had the same limit.

## Outcome — 2026-10-05

- Shipped as planned. One small change: the inbox checkbox label is now inline (flex), where the old
  `/admin` grid stacked the box above its word.
- Not checked in a browser against real data. The panel talks to production, so the check is on the
  PR preview channel. The same limit applied to E2.7.
- Rejected: a shared sign-in gate or layout, and an `equalTo(null)` + `.indexOn` count query.
- Traps for next time:
  - The count and the checkbox must both go through `isHandled` in `src/enquiry.ts`. If you
    inline `handled === true` on one side, the two can drift.
  - `/admin/zapytania` redirects instead of signing in. A link sent to Hanna (Telegram, email) should
    point at `/admin`, or it lands there anyway after sign-in.
