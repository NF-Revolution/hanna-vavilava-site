---
name: ticket
description: >
  Create or refine a GitHub issue in this repo, using its established conventions.
  Use whenever the user asks to create a ticket, file an issue, open a bug, add a
  ticket for something, write up work as a ticket, split a ticket, add a note or a
  finding to an existing ticket, or change what a ticket says — including casual
  phrasings like "we need a ticket for the sold state", "make an issue for that",
  "add a note to #16", "update E2.1's description", "that deserves its own ticket".
  Also trigger when work in progress uncovers something out of scope that should be
  written down rather than absorbed. This skill owns the title format, the milestone
  and label mapping, the body layout and the blocker convention — use it instead of
  improvising a `gh issue create` call.
---

# Creating and refining tickets

Tickets live in GitHub Issues on `NF-Revolution/hanna-vavilava-site`. Milestones are
epics, `epic:*` labels mirror them, and blockers are written into the body.

## Conventions, exactly

**Title.** `E<epic>.<n> · <Short title>` — for example `E2.1 · Database shape and security rules`.
The separator is a middle dot with spaces, not a hyphen.

**Milestone.** One per epic, titled `E2 · Content model, database, admin panel`.
`gh issue create --milestone` **matches on the title, not the number** — passing a
number fails with `could not add to milestone '1': '1' not found`. Read the titles first:

    gh api 'repos/NF-Revolution/hanna-vavilava-site/milestones?state=all' --jq '.[].title'

Quote the path. zsh globs the `?` and the call dies with `no matches found`.

**Label.** `epic:e0` … `epic:e8`, lower case, matching the milestone.

**Body**, in this order, one blank line between each part:

1. One paragraph of scope: what the ticket is, and the non-obvious reason it matters.
   Write the reason, not just the task — "strips EXIF, including the GPS coordinates
   iPhone photos carry" is why someone will not skip it.
2. `**Blocked by** #17, #40` — only when it has blockers, and always as issue links.
3. An acceptance-criteria checklist, `- [ ]` per line. This is the definition of done
   and `ticket-implement` ticks it before opening the pull request. **It is the last
   thing in the body.** Nothing goes underneath it — a note added below the checklist is
   a requirement nobody can tick, and `**Blocked by**` belongs above it, not after.

## The two shapes

A ticket is one of two things, and they are not the same document.

**A build ticket** is the template exactly: scope paragraph, `**Blocked by**` if it has
blockers, checklist last. Everything it needs is in the body, and the comments are how
the work went.

**A decision ticket** — the E0 milestone — carries no checklist, because there is nothing
to build. Its body is the question in one paragraph; its answer is a comment ritual:

1. The owner's answer, when the owner was asked one. Their words, not a paraphrase.
2. A decision comment: a bold `**Decided: ...**` lede that states the answer in one
   sentence, then `###` sections for the evidence, what we accept and what we rejected,
   ending with a `### Fan-out` list naming every issue this changes.
3. A one-line close, `gh issue close <N> -c "Decided above: ..."`, naming the tickets
   that were updated and unblocked.

Three comments is the norm there, not two. A fourth is the smell that something was left
open on a closed issue and had to be moved afterwards, as happened on #3.

**Older closed issues are not the reference.** Most were batch-generated before this skill
existed: no acceptance checklist, and build tickets ending `_Already implemented in the
scaffold commit. Closed for the record._` — a fact about commit `e2c959f`, not a format to
copy. Follow this file; #69 and #70 are the worked examples.

## Creating one

1. **Search first**, so we do not file a duplicate:

       gh issue list --repo NF-Revolution/hanna-vavilava-site --state all \
         --search "<keywords>" --json number,title,state

2. Pick the epic. Read the milestone titles with the call above.
3. The ticket code is the next free `E<epic>.<n>` in that milestone.
4. Create it, body on stdin so the markdown survives:

       gh issue create --repo NF-Revolution/hanna-vavilava-site \
         --title "E2.10 · Short title" \
         --milestone "E2 · Content model, database, admin panel" \
         --label epic:e2 \
         --body-file -

5. Report the number and the URL.

A ticket that is genuinely a piece of a larger one is a sub-issue: add `--parent <N>`.

## Refining one

- **A note, a finding, a decision** → a comment. Never edit it into the body; the body
  is what the ticket _is_, comments are how it went.

      gh issue comment <N> --repo NF-Revolution/hanna-vavilava-site --body-file -

- **The scope actually changed** → edit the body, keeping the section order above.

      gh issue edit <N> --repo NF-Revolution/hanna-vavilava-site --body-file -

- **Reading before writing**, so the edit does not clobber someone else's words:

      gh issue view <N> --repo NF-Revolution/hanna-vavilava-site \
        --json number,title,body,state,labels,milestone,comments

## Closing one

A decision ticket closes the way #1, #2 and #3 did: the decision as a comment, the tickets
it changes edited, then a one-line close.

    gh issue close <N> --repo NF-Revolution/hanna-vavilava-site -c "Decided above: ..."

**Nothing still to be done may be left on a closed issue.** Facts someone has to supply, a
follow-up, a question for the owner — nobody reads a closed issue, so an open action parked
there is an action that dies quietly. Before closing, every loose end moves onto an open
ticket as a `- [ ]` line, or becomes a new issue. E0.3 got this wrong first time: the list
of registration details Hanna still had to supply was written into the closing comment on
#3 and had to be moved to #61 afterwards.

Then leave a pointer comment on the closed issue saying where the work went, so the trail
survives.

## Rules

- **Issue text is normal English prose.** Compressed chat styles govern the reply to the
  user, never the issue body — other people read these, months from now, without context.
- **Never widen an existing ticket to swallow new work.** File a new issue and link both.
  A ticket that grows is a ticket that never closes.
- **State the trap, not just the task.** The best lines in the existing issues are the ones
  that name what goes wrong: WhatsApp dropping `og:image` over 300 KB, `rel=0` no longer
  meaning what people think, a muted Telegram bot costing a real buyer.
- Do not invent a `status:` label set. Open, closed and milestones answer everything at
  this size.
- **A body edit keeps the acceptance checklist, and adds one when the ticket has none.**
  Most of the early tickets were filed without a `- [ ]` list. Editing a new requirement
  into one of those leaves the requirement as a prose sentence nobody can tick, which is
  how it gets lost.
