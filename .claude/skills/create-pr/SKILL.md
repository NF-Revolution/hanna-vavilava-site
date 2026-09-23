---
name: create-pr
description: >
  Ship the change that already exists as a GitHub pull request in this repo — branch,
  commit, push, open the pull request. Use whenever the user asks to open a PR, push
  this, ship this, raise a pull request, "make a PR for #16", "put this up for review",
  or pastes an issue link and asks for the change to go out. Also use when a change is
  already committed on a branch and only the push and the pull request are missing, and
  when `ticket-implement` reaches its pull-request step. This skill owns branch naming,
  commit subjects, the pull-request body, `Closes #N`, and the exact `gh pr create`
  invocation for this repo — use it instead of improvising `gh` calls.
argument-hint: '[issue-number]'
---

# Opening a pull request

Repo: `NF-Revolution/hanna-vavilava-site`. Base branch: `main`. Implement nothing — the
change is already written. If there is no change, say so and stop; do not invent one.

## 1. Is there anything to ship

    git status --short
    git log main.. --oneline

Dirty worktree, commits ahead of `main`, or an edit made earlier in this conversation →
ship it. None of those → "nothing to ship", stop.

## 2. Which issue

The number given at invocation, else `#N` in the branch name, else
`gh issue list --repo NF-Revolution/hanna-vavilava-site --search "<words> in:title" --json number,title`.
No issue at all is allowed — the pull request then just carries no `Closes` line.

## 3. Branch

On `main` with an issue → `gh issue develop <N> --repo NF-Revolution/hanna-vavilava-site --base main --checkout`
(GitHub names it and links it to the issue). No issue → `git checkout -b <type>/<kebab-slug>`,
same `<type>` as the commit subject below. Already on a feature branch → stay on it.
Uncommitted changes carry over either way.

## 4. Verify before pushing

    npm run ci 2>&1 | tail -30

Format check, types, build, link check — the same job CI runs on the pull request. It fails →
fix it or report the failure verbatim. Never open a pull request on a red tree.

`tail -30` because a green run is 40 lines of build chatter and a red one puts the error at
the end. Need more, write the whole log to a file in the scratchpad directory and grep that
— never pour a build log into this window.

Two things `npm run ci` cannot check, so check them by eye:

- **Artboards.** A change a visitor can see changes its board in this same pull request
  (`AGENTS.md`, `## Design`). Not done → do it before opening, or the pull request is incomplete.
- **i18n.** New strings exist in both `src/i18n/pl.json` and `src/i18n/en.json`.

## 5. Commit and push

    git add <the changed files>
    git commit -m "<type>: <subject>"
    git push -u origin HEAD

Conventional Commits, lower case, imperative, no ticket ID and no `Closes` in the subject —
that line belongs in the pull-request body, where a squash merge keeps it. Types in use:
`feat`, `fix`, `docs`, `chore`. Tree already clean → skip the commit, still push.

End the commit message with the attribution line the session's instructions give.

## 6. Open it

    gh pr create --repo NF-Revolution/hanna-vavilava-site --base main \
      --title "<type>: <subject>" --body-file - <<'EOF'
    ## Summary

    <one or two lines: what changed and why>

    ## Checks

    - `npm run ci` passes locally
    - <artboard note: which board changed, or why none needed to>
    - independent review: clear | <n> fixed | <n> disputed — <one line each>

    Closes #<N>
    EOF

`Closes #<N>` in the body, never in a commit message: it survives the squash merge and
merging then closes the ticket, so the milestone burndown stays honest.

A pull request already open for this branch makes `gh pr create` fail. That is not an error —
`gh pr view --json url --jq .url` and return that, so re-running is safe.

## 7. Return

Branch name, commit subject(s), pull-request URL. Nothing else. Any `git` or `gh` failure is
returned verbatim, not worked around.

The preview workflow gives the pull request a Firebase Hosting channel — a real URL to walk
through next to the artboards before merging. Mention it once it appears.
