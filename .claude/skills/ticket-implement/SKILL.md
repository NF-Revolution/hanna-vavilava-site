---
name: ticket-implement
description: >
  Pick up a GitHub issue in this repo and build it: read the description and every
  comment, check its blockers, open a linked branch, agree an approach and record it
  on the issue, implement, verify, and open a pull request that closes the ticket.
  Use whenever the user asks to implement, start, work on, pick up, continue or finish
  a ticket or issue — "implement #16", "let's do E2.1", "pick up the next ticket",
  "continue #17", "work on the database rules ticket", "start the horses page ticket",
  or a bare ticket reference with an instruction to build it. Also use when resuming
  work on a branch that was created from an issue. This skill owns reading the issue's
  full history, the branch and pull-request mechanics, and what gets written back to
  the ticket.
---

# Implementing a ticket

Repo: `NF-Revolution/hanna-vavilava-site`. Every ticket gets a branch and a pull request.
The issue — body plus comments — is the source of truth, not memory and not the plan file.

## 1. Resolve which issue

- `#16` or `16` → that issue.
- A ticket code → `gh issue list --repo NF-Revolution/hanna-vavilava-site --search "E2.1 in:title" --json number,title`
- On a branch already → `gh issue list --state all --json number,title` and match, or read
  the branch name, which `gh issue develop` derives from the issue.
- **"The next ticket"** → the lowest-numbered open issue in the earliest milestone whose
  blockers are all closed. Say which one you picked and why before starting.

## 2. Read it whole, in one call

    gh issue view <N> --repo NF-Revolution/hanna-vavilava-site \
      --json number,title,body,state,labels,milestone,comments

Read every comment, not just the body. **A later comment outranks the body**: the body is
what we thought when we filed it, the comments are what we learned since. If they conflict,
the newest decision wins and the body is stale — say so, and fix the body before building.

Use `--json` with a field list. A bare `gh issue view` on a long thread floods the context
window with rendered chrome for no gain.

## 3. Check the blockers

Parse `**Blocked by** #N` out of the body and check each one:

    gh issue view <N> --repo NF-Revolution/hanna-vavilava-site --json number,state,title

If any blocker is open, **stop** and name it. Starting blocked work produces a branch that
cannot be finished and a pull request that cannot be merged.

## 4. Branch

    gh issue develop <N> --repo NF-Revolution/hanna-vavilava-site --base main --checkout

GitHub links the branch to the issue itself, so the issue shows the work and no naming
convention has to be remembered.

## 5. Agree the approach, then record it

Discuss, settle on an approach, and post **one** comment before writing code:

- the approach, in a few lines
- what was considered and rejected, and why
- anything that surprised us about the ticket

This is the memory that survives `/clear` and a new session. It is the single highest-value
thing this skill does.

## 6. Build

Follow `AGENTS.md`. The conventions that actually bite:

- Every link goes through `path(locale, routeKey, slug)` in `src/i18n/routes.ts`. Nothing
  hardcodes a URL — the same table feeds the language switch and the hreflang tags.
- Every user-visible string exists in **both** `src/i18n/pl.json` and `src/i18n/en.json`.
  They are structurally identical and `src/i18n/index.ts` enforces it.
- Contact details and stock counts come from `src/site.ts` only.
- Anything invented is marked `PLACEHOLDER`.
- A deliberate shortcut gets a `ponytail:` comment naming its ceiling and the upgrade path.
- Public pages stay free of framework JavaScript. If a change adds a hydrated island,
  it is the wrong change.

## 7. Verify

    npm run ci

Format check, types, build, internal link check. Then tick the acceptance-criteria boxes in
the issue body — that is what the checklist is for.

## 8. Pull request

    gh pr create --repo NF-Revolution/hanna-vavilava-site --base main --title "..." --body-file -

The body contains `Closes #<N>`. In the body, not in a commit message: it survives a squash
merge, it lives in one place, and merging then closes the ticket so the milestone burndown
stays honest without anyone remembering to close anything.

The pull request also gets a Firebase Hosting preview channel, so there is a real URL to
check against the artboards before merging.

## 9. Outcome comment

One comment when the work lands: the pull-request link, what actually shipped if it differs
from the plan, and any trap the next person would otherwise hit.

## Rules

- **Scope is the issue.** Work that reveals more work becomes a new linked issue via the
  `ticket` skill — never a bigger pull request.
- **If the ticket is wrong, fix the ticket first.** Editing the body after the fact turns
  the history into fiction.
- Two comments per ticket is the target: one decision, one outcome. Anything else belongs
  in the pull request or in the code.
