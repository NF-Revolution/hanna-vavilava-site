# E2.15 · Preview build of saved horse edits — #184

Shipped 2026-10-09.

## 2026-10-09

- Branch `184-e215-preview-build-of-saved-horse-edits`. The approach comment is on #184, and
  the body's URL AC now names the `draft` GitHub environment.
- `npm run ci` green, and `npm test` passes 71/71. ticket-reviewer: clear, every AC met.

## What was built — 2026-10-09

- `functions/index.js`: the GitHub dispatch moved out of `release()` into `dispatch(event)`.
  The `preview` callable runs `adminOnly`, then `dispatch('preview')`, and returns `{ at }`.
  It does not stamp `/site/updated` and does not delete sold X-rays.
- `.github/workflows/draft.yml`: `repository_dispatch: preview` and `workflow_dispatch`, in
  concurrency group `draft` with cancel-in-progress. It runs the deploy's build without
  `HOSTING_CHANNEL`, then deploys `channelId: draft` with `expires: 30d`. It has no
  `repoToken` and no announce step. The job runs in environment `draft` with
  `url: steps.deploy.outputs.details_url`.
- `src/pages/admin.astro`: a Preview button above Publish. `deployed(workflow, since)` is
  shared with Publish. On success, `draftUrl()` reads the newest `draft` deployment's
  status `environment_url`, and the status line becomes an "Otwórz podgląd" link.
- `fromChannel(req)`: an `Origin` or `X-Forwarded-Host` containing `--` joins the honeypot
  branch in `submitEnquiry` and `subscribe`. The post goes to the sent page, and nothing is
  stored, mailed or messaged.
- Tests: `preview` refuses anonymous and non-admin callers with 403 (`rules.test.mjs`). An
  enquiry with a channel `Origin` goes to the sent page and is not stored (`enquiry.test.mjs`).

## Outcome — 2026-10-09

- Chosen: one fixed channel `draft`, built by its own workflow. The URL lives on the GitHub
  environment's deployment, because Firebase picks a new hash after the channel expires.
- Rejected:
  - Rendering pages in the admin: the copy drifts from the real components.
  - `preview` in `deploy.yml`: it shares the concurrency group, so a preview cancels a publish.
  - The Hosting REST API from the Function: its service-account role is unknown, and the
    channel does not exist on the first preview.
  - The workflow writing the URL to RTDB: needs a rules change and write access.
  - A preview banner: visible UI that would also show on PR previews.
- Traps:
  - `release()` deletes sold X-rays. Copying it for preview would delete them during a preview.
  - `repository_dispatch` only runs workflows from `main`, so `draft.yml` cannot run before
    the merge.
  - `functions:preview` deploys by hand. The changed `submitEnquiry` and `newHorses` need
    the same.
  - The panel reads the runs and deployments APIs without authentication, so it shares the
    limit of 60 requests an hour per IP with Publish's polling.
  - Test enquiries from PR preview channels reached Hanna until this ticket shipped.
