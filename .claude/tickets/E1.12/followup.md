# E1.12 — followup

Shipped 2026-10-06 — see the last `## Outcome` at the bottom.

Issue [#134](https://github.com/NF-Revolution/hanna-vavilava-site/issues/134) ·
branch `134-e112-delete-the-preview-channel-when-its-pull-request-closes` · no canvas change

## 2026-10-06

- Ticket-reviewer found a blocker: `hosting:channel:list` and `hosting:channel:delete` both run
  `.before(requireConfig)`, so without a `firebase.json` they fail even with `--project` and
  `--site` given. Fixed with a sparse checkout of `firebase.json` from the base branch.
- Plan 01 approved. Channel id confirmed against `action-hosting-deploy@v0` `src/getChannelId.ts`:
  `pr${number}-${head.ref.substr(0, 20)}`, invalid characters to `_`. The delete selects by the
  `pr<N>-` prefix from the live channel list instead of rebuilding the id.

## What was built — 2026-10-06

One file, `.github/workflows/preview.yml`:

- `pull_request.types: [opened, synchronize, reopened, closed]`. The `preview` job gains
  `github.event.action != 'closed'`, so it never deploys on close.
- New `cleanup` job on `closed`, merged or not, behind the same `FIREBASE_PROJECT_ID` and fork
  guard. It shares the `preview-<N>` concurrency group, so closing cancels a deploy still running
  that would recreate the channel.
- Steps: sparse checkout of `firebase.json` at the base branch; the service account goes to
  `$RUNNER_TEMP/service-account.json` as `GOOGLE_APPLICATION_CREDENTIALS`;
  `npx -y firebase-tools@15 hosting:channel:list --json --site hanna-vavilava-site`; jq picks the
  ids that start with `pr<N>-`; `hosting:channel:delete <id> --force` for each one.
- No match means a fork pull request or an expired channel, and the job exits 0. A failed list
  (bad credentials) or a changed JSON shape (`.result.channels` missing, so jq cannot iterate
  null) fails the job.

Rejected:

- Rebuilding the id with `cut -c1-20`, which copies upstream's truncation rule.
- `delete || true`, which hides authentication failures.
- A sibling workflow, which repeats the guard and the concurrency group.

## Outcome — 2026-10-06

- Checked locally: the jq filter run on sample list JSON returns `pr133-46-e57-confirmation-` for
  133, `pr13-foo` for 13, nothing for 7, and never `live`. `npm run ci` is green.
- Not yet run for real. The `closed` run uses the workflow from the merge commit, so merging this
  pull request is the first live test: its own channel should go. Check the run log and
  `hosting:channel:list` (AC5).
- Trap: channels from pull requests closed between 2026-10-01 and this merge are not deleted
  retroactively. They expire 14 days after their last deploy, or delete them once by hand.
- Trap: the firebase CLI channel commands need a `firebase.json` in the working directory, even
  when `--project` and `--site` are given.
