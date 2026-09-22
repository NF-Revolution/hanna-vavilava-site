---
name: skill-forge
description: >
  Turn a correction or a repeated request into a durable instruction, so the same
  mistake is not made twice and the same prompt is not typed twice. Use whenever the
  user points out that something in the output is wrong, missing or not what they
  asked for — "no, you forgot the i18n keys", "I told you to use path()", "that's not
  what I meant", "you did this wrong again", "why did you hardcode that" — and use it
  after fixing the immediate problem, not instead of fixing it. Also use when the user
  asks for the same shape of work a third time, when they ask to remember a preference
  or a way of working, when they ask to improve, tune or fix a skill, and on
  "/skill-forge" or "/skill-forge scan". This skill owns where a lesson is written,
  what one looks like, and the rule that nothing is written until the user says yes.
---

# Turning corrections into instructions

A lesson that lives only in a session transcript is lost at the end of the session.
This skill decides where it lives instead: a repo skill, `AGENTS.md`, or a memory file.

Everything here is scoped to this repo. Nothing writes to `~/.claude/skills/`, and
nothing edits a plugin skill under `~/.claude/plugins/` — `caveman`, `ponytail` and
the `ddy-sdlc` skills are overwritten whenever their plugin updates, so an edit there
is deleted without warning. Lessons about them go to memory.

## When this fires

**A correction.** The user says the output is wrong. Fix the thing first. Then, in the
same reply, propose where the lesson goes.

**A third repeat.** The user asks for the same shape of work for the third time, or a
memory file already carries the same lesson twice. That is the promotion trigger.

**On request.** `/skill-forge` to capture a lesson now, `/skill-forge scan` to go
looking for repeats.

## Route the lesson

One decision, made before writing anything:

**A repo skill's workflow was wrong** — the ticket format, the branch mechanics, the
order of steps. Goes to that skill's `## Learned` section: `.claude/skills/ticket/`,
`.claude/skills/ticket-implement/`, or this file.

**A repo convention no skill owns** — i18n keys, `path()` in `src/i18n/routes.ts`,
contact details in `src/site.ts`, the artboard rule. One line in `AGENTS.md`, under
the heading it belongs to. `AGENTS.md` is read on every session in this repo, so
this is the strongest place and the easiest to overfill. Keep it to one line.

**How the agent behaves in general** — tone, when to ask instead of assume, which
tool to reach for, how much to verify before claiming done. A memory file in
`~/.claude/projects/-Users-maksnasalevich-Documents-PycharmProjects-hanna-vavilava-site/memory/`,
`type: feedback`, with the `**Why:**` and `**How to apply:**` lines the memory format
requires. Add the pointer line to `MEMORY.md`.

**A plugin or global skill misbehaving** — memory file, same as above. Never the plugin.

When two routes both fit, take the narrowest one. A lesson in `AGENTS.md` costs tokens
on every single session in this repo; the same lesson in a skill costs nothing until
that skill is invoked.

## What a written lesson looks like

Appended to a `## Learned` section at the bottom of the skill, one dated line each:

    ## Learned

    - 2026-09-21 — Pass milestones by title. `gh issue create --milestone 1` fails
      with `could not add to milestone '1': '1' not found`.

Name the failure, not the virtue. "Be careful with milestones" changes nothing;
the error string is what makes it recognisable next time.

When `## Learned` passes ten lines, stop appending and fold them into the body
sections where they belong. An append-only list at the bottom of a file is read last
and eventually not at all — that is how every "lessons learned" document dies.

## Nothing is written until the user says yes

Show the exact edit: the file path, the section, and the line going in. One short
block, not a diff of the whole file. Then wait. The user chose this deliberately —
silent self-editing means the instructions drift and nobody knows which line caused
which behaviour.

If the user says no, the lesson is dropped. Do not write it somewhere else instead.

## Third strike

There is no counter file. The memory directory is the counter.

Before writing a new `feedback` memory, grep the directory for one that already covers
the theme:

    grep -ril '<keyword>' ~/.claude/projects/-Users-maksnasalevich-Documents-PycharmProjects-hanna-vavilava-site/memory/

Found one? Update it rather than adding a second, and add or bump a `Seen: N` line in
its body. At `Seen: 3`, propose a real skill instead — invoke `skill-creator` to
scaffold it under `.claude/skills/`, and delete the memory file once the skill exists,
so the lesson has exactly one home.

## Scanning for repeats

`~/.claude/history.jsonl` is one JSON line per typed prompt, with `display`,
`timestamp` and `project`. Pasted blobs are kept out of `display` in a separate
`pastedContents` field, which makes it the right source — the session transcripts
under `~/.claude/projects/` inline pasted content and are three orders of magnitude
larger for the same text.

    jq -r 'select(.project|test("hanna-vavilava-site")) | .display' ~/.claude/history.jsonl

**Do not run that here.** Every prompt ever typed for this project would land in this
window and the useful part of it is a dozen lines. Hand the agent the command, not its
output, so the dump lands in a cheap context instead:

    Agent(subagent_type: "general-purpose", model: "haiku",
          description: "Cluster the prompt history",
          prompt: "Run the jq line above. Return semantic clusters, not exact
                   duplicates — 'debugging the same scanner', 'reviewing vet documents' —
                   with a count and one representative prompt each. Exact-match counting
                   finds only re-runs of `continue` and `go`. 15 lines at most, and never
                   paste the prompt list back.")

Drop the `select(...)` to scan every project. Say so plainly when a cluster is
cross-project: a skill in this repo only loads in this repo, so a cross-project habit
either gets a repo skill that solves it here, or nothing.

Bring back the clusters worth a skill, propose them, write nothing yet.

## Rules

- Fix the user's actual problem first. A lesson proposed instead of a fix is a way of
  not doing the work.
- One lesson, one line, one place. A lesson written into both `AGENTS.md` and a skill
  will contradict itself the first time one of them is edited.
- Never edit anything under `~/.claude/plugins/` or `~/.claude/skills/`. Plugin updates
  overwrite the first; the user scoped this skill to the repo, which rules out the second.
- Quote the failure verbatim — the error string, the wrong output, the exact phrasing
  the user objected to. Paraphrase loses the thing that makes it recognisable.
- If no existing skill owns the lesson and it is a one-off, memory is the answer. Do
  not create a skill for a lesson that has happened once.

## Learned

- 2026-09-22 — The four routes above have no row for behaviour that should hold in every
  project, not just this one. That goes in `~/.claude/CLAUDE.md`, which the scope guard
  at the top of this file does not cover: it rules out `~/.claude/skills/` and
  `~/.claude/plugins/` because plugin updates overwrite them, and the user's own global
  instructions file is neither. Take it only when the lesson would be wrong to repeat in
  every repo's `AGENTS.md`; memory is still the narrower route and wins a tie.
