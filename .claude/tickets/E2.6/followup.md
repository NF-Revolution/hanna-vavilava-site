# E2.6 · Publish button — #21

Shipped 2026-09-23.

## 2026-09-23

- Approach comment posted on #21. Branch `21-e26-publish-button`.
- Next: functions/, firebase.json, admin panel, strings, test, CI.
- Built: `functions/` (`publish` callable), `firebase.json` functions source, tsconfig exclude,
  Publish button + status poll in `/admin`, six `admin.publish*` strings in both locales,
  Publish test appended to `tests/rules.test.mjs`, functions emulator in `npm test`, CI installs
  `functions/` deps.
- `npm run ci` green, `npm test` 27/27. Mutation check: breaking the claim check turns the
  test red (500 instead of 403).
- ticket-reviewer: clear.

## 2026-09-24

- PAT set as `PUBLISH_TOKEN`, Function deployed to production. The anonymous call answers
  `PERMISSION_DENIED` ("admin only"), so the invoker is public and the claim check runs.
- The first deploy exited 1 after a successful create: no artifact cleanup policy. Fixed with
  `functions:artifacts:setpolicy --location europe-central2 --force`, which deletes images after 1 day.

## What was built — 2026-09-23

## Context

The site reads `/horses` and `/site` only at build time (E2.2), so a saved edit stays invisible
until a rebuild. `deploy.yml` already listens for `repository_dispatch: publish`. #21 needs:
a Function that checks the ID token has the `admin` claim, stamps `/site/updated`
(`YYYY-MM-DD`, Warsaw time), sends the dispatch, and a panel that shows the build status
until the deploy finishes or fails. Blockers #8 and #18 are closed. No Functions exist yet.
There is no artboard for the admin panel (E2.3 decision), so there is no board read and no canvas change.

## Approach

1. **`functions/`**, new, plain ESM JS, no build step: `package.json` (`type: module`,
   engines node 22, deps `firebase-functions`, `firebase-admin`), `index.js`:
   - `publish = onCall({ region: 'europe-central2', secrets: [PUBLISH_TOKEN] })`. `onCall`
     verifies the ID token itself. The first line is
     `if (request.auth?.token.admin !== true) throw new HttpsError('permission-denied')`.
   - Stamp: `new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format()` goes to
     `site/updated` through the Admin SDK. The `databaseURL` is explicit (europe-west1), so
     nothing depends on `FIREBASE_CONFIG`.
   - `at = Date.now()`, then POST `api.github.com/repos/NF-Revolution/hanna-vavilava-site/dispatches`
     with `{ event_type: 'publish' }`, Bearer `PUBLISH_TOKEN`. A non-2xx answer throws
     `HttpsError('internal')`. The function returns `{ updated, at }`.
   - `PUBLISH_TOKEN` is a fine-grained PAT with this repo only and Contents: read/write.
     ponytail: the PAT expires, and a GitHub App is the upgrade.
2. **`firebase.json`**: add `"functions": { "source": "functions" }`. **`tsconfig.json`**: exclude
   `functions`.
3. **Panel** `src/pages/admin.astro`, in `#list-view` below the list: a "Publish" button, a hint
   (saved edits reach the site only after Publish, which takes 2–3 min), and
   `<p id="publish-status" role="status">`.
   - Click: disable the button, show "sending…", then `httpsCallable(getFunctions(app, 'europe-central2'), 'publish')()`.
   - Watch: poll `GET api.github.com/repos/…/actions/workflows/deploy.yml/runs?event=repository_dispatch&per_page=1`
     every 15 s with `cache: 'no-store'`. Ignore a run older than `at - 5 s`. `completed` +
     `success` shows done, any other conclusion shows failed. No finish within 15 min shows failed.
     The button comes back on at the end.
   - ponytail: the poll is the unauthenticated GitHub API. The ceiling is 60 requests an hour per IP,
     and the repo must stay public. The upgrade is a status callable that uses the PAT.
   - `firebase/functions` goes into the admin chunk only.
4. **Strings** go into both `pl.json` and `en.json` under `admin`: `publish`, `publishHint`,
   `publishSending`, `publishBuilding`, `publishDone`, `publishFailed`.
5. **Check**: `tests/publish.test.mjs` runs on the functions emulator. It POSTs the callable with
   no token and with a non-admin unsigned token. Both return 403, and `site/updated` stays null.
   `npm test` adds `functions` to `--only`. `ci.yml` adds `npm ci --prefix functions`
   before `npm test`.

Skipped: a test of the admin path, because it needs a real GitHub token; a run link in the panel;
automatic Function deploy from `deploy.yml`, because it is by hand like the rules and a CI deploy
needs more service-account roles.

## Process

Approach comment on #21, then `gh issue develop 21 --base main --checkout`. Copy the plan to
`.claude/tickets/E2.6/`, then build, then `npm run ci` + `npm test`, then `ticket-reviewer`, then
`create-pr`, which finalizes the notes and adds the INDEX.md state row and decision line. Then the outcome comment.

The owner does the production steps, or I do them on their go-ahead:

1. Create the PAT.
2. `npx firebase-tools@15 functions:secrets:set PUBLISH_TOKEN --project hanna-vavilava-site`
3. `npx firebase-tools@15 deploy --only functions --project hanna-vavilava-site`

## Verification

- `npm run ci` green. `npm test` green, with the functions emulator.
- `grep -rl firebase dist --include='*.html'` returns only `dist/admin/index.html`.
- After the production deploy: Publish in `/admin` shows building, then done. `/site/updated` shows
  today's date, and the header's "stan stajni" date moves on the live site.

## Outcome — 2026-09-23

- Shipped as planned. The approach is on #21. The Function has been deployed to production (2026-09-24).
- The Publish test sits in `tests/rules.test.mjs` rather than in its own file, so it reuses the
  unsigned-token helper.
- Rejected: a status path written back by the workflow, the panel stamping `/site/updated` itself,
  a GitHub App, and deploying Functions from `deploy.yml`.
- Traps for next time:
  - The functions emulator skips token verification, so unsigned test tokens reach the handler.
    Assert 403, not 401, because 401 would also pass with a broken token.
  - The Function's Admin SDK uses the explicit europe-west1 `databaseURL`. Under the emulator it
    therefore writes to the `hanna-vavilava-site-default-rtdb` namespace, not `demo-hv-default-rtdb`.
  - `functions/` has its own `node_modules`. CI runs `npm ci --prefix functions` before `npm test`,
    and a fresh checkout has to run it locally too.
  - `tsconfig.json` excludes `functions`, because the root `**/*` include would otherwise pull it
    into `astro check`.
  - A first `deploy --only functions` in a new region exits 1 without an artifact cleanup policy,
    even though the Function is live. Run `functions:artifacts:setpolicy` once per region.
  - A push to `main` during a publish cancels the dispatch run (`cancel-in-progress`). The panel then
    says the publish failed, but the push deploy still carries the edit.
