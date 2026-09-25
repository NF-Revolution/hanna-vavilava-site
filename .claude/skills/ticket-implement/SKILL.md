---
name: ticket-implement
description: >
  Pick up a GitHub issue in this repo and build it: read the description and every
  comment, check its blockers, open a linked branch, agree an approach and record it
  on the issue, implement, verify, have a fresh agent review it, and open a pull
  request that closes the ticket.
  Use whenever the user asks to implement, start, work on, pick up, continue or finish
  a ticket or issue — "implement #16", "let's do E2.1", "pick up the next ticket",
  "continue #17", "work on the database rules ticket", "start the horses page ticket",
  or a bare ticket reference with an instruction to build it. Also use when resuming
  work on a branch that was created from an issue, and when the user asks to run one or
  more tickets in parallel, in the background or in a worktree — "run #24 and #31 in
  parallel", "start E2.9 in the background". This skill owns reading the issue's
  full history, the branch and pull-request mechanics, and what gets written back to
  the ticket.
---

# Implementing a ticket

Repo: `NF-Revolution/hanna-vavilava-site`. Every ticket gets a branch and a pull request.
The issue — body plus comments — is the source of truth, not memory and not the plan file.

## 0. In parallel

Asked to run tickets in parallel or in the background → build nothing in this session.
For each ticket, read its code from `gh issue view <N> --json title` (`E2.9` → worktree
`e2-9`) and launch one background session:

    claude --bg -w <worktree> --permission-mode plan "/ticket-implement #<N>"

Return one line per ticket — code, session id — and point at `claude agents` and
`claude attach <id>`. Each session checks its own blockers (§3). Once the pull requests
merge, `worktree-clean` removes the sessions, worktrees and branches.

A session started in plan mode does §1–§3 and the board read, then presents the approach
for approval. The branch (§4) and the approach comment (§5) come right after approval.

## 1. Resolve which issue

- `#16` or `16` → that issue.
- A ticket code → `gh issue list --repo NF-Revolution/hanna-vavilava-site --search "E2.1 in:title" --json number,title`
- On a branch already → `gh issue list --state all --json number,title` and match, or read
  the branch name, which `gh issue develop` derives from the issue.
- **"The next ticket"** → one `issue-reader` call. The answer is the lowest-numbered open
  issue in the earliest milestone whose blockers are all closed, and finding it means
  reading most of the open tickets for a one-line result:

      Agent(subagent_type: "issue-reader", description: "Pick the next ticket",
            prompt: "Next ticket. No number given.")

  Say which one it picked and why before starting.

## 2. Read it whole, in one call

    gh issue view <N> --repo NF-Revolution/hanna-vavilava-site \
      --json number,title,body,state,labels,milestone,comments

Read every comment, not just the body. **A later comment outranks the body**: the body is
what we thought when we filed it, the comments are what we learned since. If they conflict,
the newest decision wins and the body is stale — say so, and fix the body before building.

Use `--json` with a field list. A bare `gh issue view` on a long thread floods the context
window with rendered chrome for no gain.

**This read stays in this window.** It is the one place delegation is wrong: you build from
the ticket's own wording, and a digest is how an acceptance criterion goes quietly missing.
`issue-reader` is for the questions around the ticket, never for the ticket itself.

## 3. Check the blockers

Delegate this one — it is a status question over however many blockers there are, and the
answer is one line each:

    Agent(subagent_type: "issue-reader", description: "Check blockers for #<N>",
          prompt: "Blockers for #<N>.")

It parses `**Blocked by** #N` out of the body itself and reads those tickets one level down.

If any blocker is open, **stop** and name it. Starting blocked work produces a branch that
cannot be finished and a pull request that cannot be merged.

## 4. Branch

    gh issue develop <N> --repo NF-Revolution/hanna-vavilava-site --base main --checkout

GitHub links the branch to the issue itself, so the issue shows the work and no naming
convention has to be remembered.

**A decision ticket opens no branch and no pull request** — an E0 ticket produces a
comment and edits to other tickets, and there is nothing to merge. A canvas ticket does
not either; `artboards` owns that case. Both still close through their own ritual.

## 5. Read the design, then agree the approach

Anything a visitor can see: read the boards **before** the approach is settled. Delegate
the read — a board is long and its source belongs in a subagent's context, not this one:

    Agent(subagent_type: "artboard-reader", description: "Read artboards for #<N>",
          prompt: "Screens: <screens>. Ticket #<N>: <one line of what it asks for>.")

`.claude/agents/artboard-reader.md` holds the canvas link, the read order and the output
shape, and runs on Haiku. `Explore` cannot stand in for it — `Explore` has no `Artifact`
tool and the canvas is not a repo file.

Then discuss, settle on an approach, and post **one** comment before writing code:

- what the boards show, in a few lines — the summary above, trimmed
- the approach, in a few lines
- what was considered and rejected, and why
- anything that surprised us about the ticket

This is the memory that survives `/clear` and a new session. It is the single highest-value
thing this skill does.

## 6. Build

Follow `AGENTS.md`. The conventions that actually bite:

- Build to the board summary from §5, not to memory of how the site looks.
- Every link goes through `path(locale, routeKey, slug)` in `src/i18n/routes.ts`. Nothing
  hardcodes a URL — the same table feeds the language switch and the hreflang tags.
- Every user-visible string exists in **both** `src/i18n/pl.json` and `src/i18n/en.json`.
  They are structurally identical and `src/i18n/index.ts` enforces it.
- Contact details and stock counts come from `src/site.ts` only.
- Anything invented is marked `PLACEHOLDER`.
- A deliberate shortcut gets a `ponytail:` comment naming its ceiling and the upgrade path.
- Public pages stay free of framework JavaScript. If a change adds a hydrated island,
  it is the wrong change.
- A change you can see on a page changes its artboard too, in the same pull request. Link
  and read mechanics: `AGENTS.md`, `## Design`.

## 7. Verify

Fresh worktree (no `node_modules`) → `npm ci` first.

    npm run ci

Format check, types, build, internal link check. Then tick the acceptance-criteria boxes in
the issue body — that is what the checklist is for.

## 8. Independent review

Once `npm run ci` is green, before the pull request, one reviewer with fresh eyes:

    Agent(subagent_type: "ticket-reviewer", description: "Review #<N>",
          prompt: "#<N>. Diff: working tree vs main.")

The prompt carries nothing else — no approach, no plan, no summary of what was built. The
reviewer is useful because it has not seen how we got here; a briefing gives that away.
It reports only blocker, critical and high findings, and `Verdict: clear` is a normal answer.

For each finding, check it yourself — the reviewer can be wrong too:

- Real → fix it, re-run `npm run ci`.
- Wrong → a one-line rebuttal naming why.
- Real but outside the ticket → a new linked issue via the `ticket` skill.

A fix bigger than a few lines → review once more. Two rounds at most; a finding still in
dispute after that goes to the user. The verdict goes into the pull-request body.

## 9. Pull request

The `create-pr` skill — it owns the commit subject, the body, `Closes #<N>` and the exact
`gh pr create` call, and it re-runs safely if a pull request already exists.

## 10. Outcome comment

One comment when the work lands: the pull-request link, what actually shipped if it differs
from the plan, and any trap the next person would otherwise hit.

## Rules

- **Scope is the issue.** Work that reveals more work becomes a new linked issue via the
  `ticket` skill — never a bigger pull request.
- **If the ticket is wrong, fix the ticket first.** Editing the body after the fact turns
  the history into fiction.
- Two comments per build ticket is the target: one approach, one outcome. Anything else
  belongs in the pull request or in the code. A decision ticket follows the three-comment
  ritual in `ticket`; a canvas ticket follows `artboards`.
