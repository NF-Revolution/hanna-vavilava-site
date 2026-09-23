# E2.1 — followup

Shipped 2026-09-23 — see the last `## Outcome` at the bottom.

Issue [#16](https://github.com/NF-Revolution/hanna-vavilava-site/issues/16) ·
branch `16-e21-database-shape-and-security-rules`

## 2026-09-23 — built

- `src/horse.ts`, `database.rules.json`, `tests/{rules,horse}.test.mjs`, `npm test`, CI Java step.
- `npm test`: 15/15 pass on firebase-tools 15.30.2. The emulator accepts unsigned tokens via `?auth=`.
- Trap: `node --test tests/` treats the directory as a file (`MODULE_NOT_FOUND`); pass the glob.
- Trap: the emulator writes `database-debug.log` to the repo root; it is gitignored now.
- `npm run ci` green. `ticket-reviewer`: clear, all six criteria met. Boxes ticked on #16.

## 2026-09-23

- No blockers: the body has no `**Blocked by**`, and #1–#4 are closed. No comments on #16.
- Stale body: it says anonymous create-only writes to `/enquiries` and `/subscribers`, but #42
  writes through a Function behind Turnstile and a rate limit, and #48 needs double opt-in.
  Owner's call: Functions-only, the whole tree admin-only. Body fixed before building.
- Plan 01 approved. Branch created.

## What was built — 2026-09-23

From `plans/01-schema-rules.md`, as approved:

### Context

The horses live in Realtime Database. E2.2 (loader), E2.3/E2.4 (admin) and E5.3 (submitEnquiry)
all need one shared horse schema and live rules. #16 has no blockers and no comments. #1–#4 are
closed, and their decisions are already in the body.

**The body is stale on one point, and the user settled it (2026-09-23): Functions-only writes.**
The body says `/enquiries` and `/subscribers` accept anonymous create-only pushes. But #42
writes enquiries from a Cloud Function behind Turnstile, a honeypot and a per-IP rate limit, and
#48 needs double opt-in. The Admin SDK skips the rules, so an open client write would only let a
spammer go around those protections. The rules therefore become: **the whole tree is admin-only,
and Functions write through the Admin SDK.** Fix the body before building (skill rule).

No visitor-visible change, so no artboard edit. The board inventory (HorseDetail, MobileDetail,
Horses, HorsesGrid) drives the schema fields.

### Steps

1. **Ticket notes**: create `.claude/tickets/E2.1/` with `INDEX.md`, `plans/01-schema-rules.md`
   (this plan) and `followup.md`.
2. **Fix the #16 body** (`gh issue edit 16 --body-file`):
   - Rules paragraph: every path is read/write for `auth.token.admin === true` only. Enquiries and
     subscribers arrive through Functions (#42, #48) via the Admin SDK. Say why: an open write
     goes around Turnstile and the rate limit.
   - Test criterion becomes: anonymous write to `/horses` fails, anonymous push to `/enquiries`
     fails, anonymous read of `/enquiries` fails, a signed-in non-admin is denied, and an admin
     token reads and writes.
3. **Approach comment** on #16: the board inventory, the approach, what was rejected (open
   create-only writes, per-field `.validate` rules for horses, `@firebase/rules-unit-testing`,
   `firebase-tools` as a devDependency, `.firebaserc`), and the surprise (the conflict with #42).
4. **Branch**: `gh issue develop 16 --repo NF-Revolution/hanna-vavilava-site --base main --checkout`.
5. **Build**:
   - `src/horse.ts`: `import { z } from 'astro/zod'` (zod 4.6.5 ships with Astro, so no new
     dependency). `ponytail:` comment: E5.3's Function package adds `zod` directly when it
     needs the schema outside Astro. Shape:
     - `text = z.object({ pl, en })`; `key = z.string().regex(/^[a-z0-9][\w./-]*$/i)`. No `:`
       is allowed, so an absolute URL cannot pass. The base is `site.media.base`, which already
       exists in `src/site.ts`.
     - `z.strictObject` at the top level, so a stray field such as `owner` fails the parse.
       This covers the "no owner field" criterion.
     - Identity: `name`, `sex: enum['mare','gelding']` (the boards draw these two only), `born`,
       `heightCm`, `breed: string` (studbook code; an enum would block the first Oldenburg horse),
       `pedigree: string` (proper names, not translated).
     - Headline: `levelCm`, `price` and `seller` exactly as the body writes them, `headline: text`.
     - `facts`: the 10 fact-table rows the structured fields do not already cover (`breeding`,
       `trainingLevel`, `lastStart`, `starts`, `technique`, `rideability`, `temperament`,
       `handling`, `location`, `documents`), all `text`. The labels live in i18n (E4.4).
     - `suits` and `notFor`: `text[]`.
     - `health`: `{ vaccinations: text, dewormedOn: string, knownIssues: text }`, plus a
       top-level `xrays` that copies the body verbatim.
     - `viewing`: `{ lead: text, airport: text, visitDay: text }`.
     - `videos`: exactly as the body writes them. `photos`: `[{ key, caption: text }]`.
     - The slug is the key under `/horses`, not a field. Export `horseSchema` and
       `type Horse = z.infer<…>`.
     - `ponytail:` comments: one `headline` serves both the detail hook and the list-card blurb
       (split it if E4.x needs two); `status` (sold) is added by E2.8; the `/site` schema is
       added by E2.2 when it reads the node.
   - `database.rules.json`: four explicit blocks (`horses`, `site`, `enquiries`, `subscribers`),
     each `.read`/`.write` = `auth != null && auth.token.admin === true`. Any unknown path is
     denied.
   - `firebase.json`: add `"database": { "rules": "database.rules.json" }`.
   - `tests/rules.test.mjs`: `node:test` plus `fetch` against the emulator REST API
     (`FIREBASE_DATABASE_EMULATOR_HOST`, `?ns=demo-hv-default-rtdb`). A table of cases: the
     anonymous and non-admin cases above must return 401, and the admin cases must return 200.
     Admin and non-admin tokens are hand-built unsigned JWTs (`alg: none`), which the emulator
     accepts. Fallback if it rejects them: keep only the anonymous cases and write a `ponytail:`
     ceiling note.
   - `tests/horse.test.mjs`: imports `src/horse.ts` (Node 22 strips the types). Checks that the
     Cascada sample parses and `xrays.files` defaults to `[]`, that `price: 0` fails, and that
     an `owner` field fails.
   - `package.json`: `"test": "npx -y firebase-tools@15 emulators:exec --only database --project demo-hv 'node --test tests/'"`.
     `npx` is used rather than a devDependency, following the wrangler precedent. The `demo-`
     project cannot touch production and needs no `.firebaserc`.
   - `.github/workflows/ci.yml`: add `actions/setup-java@v4` (temurin 21) and `run: npm test`
     after `npm run ci`. `npm run ci` stays free of Java.
   - `.claude/tickets/INDEX.md`: add the E2.1 row. Add a decision line: Functions-only writes,
     and the admin custom claim that E2.3 sets with `setCustomUserClaims`. Correct the
     `.firebaserc` line: the emulator uses `demo-hv`, so no file.
6. **Verify**: run `npm run ci` and `npm test` locally (Java 23 and firebase 15.30.2 are
   present). Tick the boxes on #16.
7. **Review**: run `ticket-reviewer` with the prompt `#16. Diff: working tree vs main.` Check
   each finding, fix it, then re-run CI.
8. **Finalize the notes** (`## What was built`, `## Outcome`; delete `INDEX.md` and `plans/`),
   then run the `create-pr` skill (`Closes #16`).
9. **Outcome comment** on #16 with the pull-request link. Include the trap for #18: the admin
   account needs the `admin: true` claim, or every read is denied. The production rules deploy
   (`firebase deploy --only database --project hanna-vavilava-site`) runs only after the user
   confirms it, because it is outward-facing.

### Verification

- `npm test`: the emulator starts, all rules cases pass, and the schema test passes.
- `npm run ci`: green.
- CI on the pull request: the new `npm test` step is green.

## Outcome — 2026-09-23

- Shipped as planned: `src/horse.ts` (strict zod on Astro's zod 4), `database.rules.json`
  (four paths, admin claim only), 15 emulator and schema tests behind `npm test`, and a Java
  step in CI. `firebase.json` gained one line.
- Approach changed from the original body: no anonymous writes anywhere. Owner's call, and
  the body was fixed before building.
- Rejected: create-only open writes, `.validate` rules mirroring zod,
  `@firebase/rules-unit-testing`, `firebase-tools` as a devDependency, `.firebaserc`, a
  `/site` schema, and a `status` field.
- Traps for next time:
  - `node --test <dir>` does not walk a directory. Pass a glob.
  - The emulator drops `database-debug.log` in the repo root.
  - The admin panel (#18) sees nothing until the account carries `admin: true`.
  - The production rules are not deployed from CI. Run
    `firebase deploy --only database --project hanna-vavilava-site` by hand.
