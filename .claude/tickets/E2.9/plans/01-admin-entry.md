# E2.9 (#24) — Seed the four real horses

## Context
The last E2 ticket before real content goes live. The site needs Hanna's four real horses in the prod Realtime Database, replacing the invented Cascada and Norton that are seeded now. Blockers #19 and #20 are closed. The admin already covers every field: editor, photos, X-rays, price and seller, publish. So this is **data entry by Hanna or the user through `/admin`, not code**. I don't have the real facts and won't invent them. Agreed: entry goes through `/admin`.

The issue body is stale:
- `src/site.ts` no longer holds any horses. Since E2.2 it reads `/horses` at build time.
- The invented horses live in `src/fixture.json`, which is the CI and no-secret build source. A fixture build can never reach the live site: `src/content.config.ts:8`. They should stay there as test data. They are marked PLACEHOLDER (78 marks), and `tests/*.test.mjs` uses Cascada.
- Only Cascada was seeded to prod (E2.2). Norton is fixture-only (E2.8).
- The admin has no horse delete. Removing `horses/cascada` is a one-off in the Firebase console, not a feature.
- Video object keys wait on #26, which is still open. A horse can go live with `videos: []` and get its keys once #26 lands.

## Steps
1. `gh issue develop 24 --base main --checkout`.
2. **Fix the issue body first** (`ticket` skill):
   - The AC "gone from `src/site.ts` and from the database" becomes "gone from the prod database; `src/fixture.json` keeps them as CI build data".
   - The video AC becomes "video keys where #26 has produced them, otherwise `videos: []`".
3. **Approach comment** on #24: no boards needed, because the ticket changes no layout. It covers the approach above, the fixture-stays decision, and the console delete.
4. **Operator checklist** in `.claude/tickets/E2.9/followup.md` (ticket-notes), taken from `src/horse.ts` `horseSchema`. For each horse:
   - slug, name, facts in PL and EN
   - `price` (EUR, or null for "on request") and `seller` (company/private)
   - `xrays`: count, date, scope in PL and EN, and PDFs only where the owner agrees
   - photos with alt text in PL and EN
   - `order`, `status`, then Publish

   Close with the final step: delete `horses/cascada` in the Firebase console, then Publish again.
5. **Hand off to the user.** They enter the four horses in `/admin` and tell me when done.
6. **Verify after entry**:
   - A local build with `FIREBASE_SERVICE_ACCOUNT` set reads prod.
   - Every `/konie/<slug>` and `/en/horses/<slug>` renders.
   - `npm run ci` is green.
   - A read-only check that `/horses` has exactly the four real slugs and no `cascada`.
   - Tick the AC boxes in #24.
7. **Out of scope, noted rather than absorbed:**
   - `home.videoAlt` in `src/i18n/{pl,en}.json:126` names Cascada. It belongs to the hero video, so add a note on #26 via the `ticket` skill.
8. `ticket-reviewer` has nearly nothing to review (notes only), so skip it and say so in the pull request. `create-pr` opens a notes-only pull request with `Closes #24`. Finalize the ticket-notes folder at that point, then post the outcome comment.

## Not doing
- Seeding script or prod writes from here. The user chose `/admin`.
- A horse delete button. Add it when Hanna needs to delete horses routinely; sold horses keep their pages.
- Changing the fixture or tests.

## Verification
- `npm run ci` green on a prod-reading build.
- Four horse pages render in PL and EN.
- The DB read shows no invented slug.
