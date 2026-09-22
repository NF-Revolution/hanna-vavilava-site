---
name: artboards
description: >
  File and carry out a change to the artboard canvas — the design, not the code.
  Use whenever a decision or a build changes something a visitor can see and no board
  draws it yet: "the artboards need updating", "add the sold state to the design",
  "the boards are stale", "update the horse detail artboard", "file a design ticket",
  "change the copy on the mobile board". Also use proactively the moment a decision
  ticket settles something visual, because a decision opens no pull request and the
  canvas therefore goes stale silently. This skill owns which boards exist, how they
  are read and written, and the fact that canvas work has no branch and no pull request.
---

# Changing the design

The design is an Artifact canvas, `F7qeoBwkyu2Dau5p1iLg2n` — "Hanna Vavilava — sales
site". `project/canvas.json` indexes the boards, one per screen and breakpoint;
`project/<Board>.dc.html` is one board's whole source.

**It is not in git.** Nothing here branches, opens a pull request, or runs `npm run ci`,
and there is no diff for anyone to review afterwards. The ticket and its closing comment
are the only record that a board changed.

Read it with the Artifact tool's `read` action, never WebFetch. That read returns the
canvas type's own write-back mechanics — **follow those**, not a remembered copy of them,
and not the summary below, which exists only to say what this repo does with them.

**`/design-sync` and the `DesignSync` tool are the wrong thing.** They drive
claude.ai/design _design-system projects_ — component libraries. This canvas is an
Artifact of type "Design" and is driven by the Artifact tool alone.

## When a design ticket is owed

A change to public UI changes its artboard: new screen, new state, moved element, changed
component copy.

- **Work that opens a pull request** updates the board in that pull request. `AGENTS.md`
  already says so and `ticket-implement` carries the bullet. Nothing to file.
- **Work that opens no pull request** — an E0 decision, an owner's answer in a comment,
  a copy change agreed in conversation — files a design ticket instead. This is the case
  that gets missed, because the rule as written only bites on pull requests, and the
  canvas is the spec everyone reads before building.

If the change needs a design _decision_ rather than a redraw — a state nobody has
specified, like the sold treatment in #23 — that belongs on the ticket that owns the
decision, not here. This skill draws what has been decided.

## Filing one

First find out what the boards already draw — filing needs the board file names, and
"no board draws it yet" is a claim worth checking before a ticket asserts it:

    Agent(subagent_type: "artboard-reader", description: "Check boards for <screen>",
          prompt: "Screens: <screens>. Does any board draw <the change>?")

Its `Not drawn` line is the ticket. Filing is the half of this skill that delegates;
carrying one out cannot, see below.

The `ticket` skill's conventions, unchanged: `E<epic>.<n> · <Short title>`, the milestone
of the screen the board draws, the matching `epic:*` label. Plus:

- the `design` label, so canvas work is findable as a class;
- the boards named by file in the body, so nobody has to guess which ones;
- one acceptance box per board, because the commonest failure here is changing the
  desktop board and forgetting its 390px twin.

## Carrying one out

1. `read` `project/canvas.json` — it has the board paths and each board's frame.
2. `read` only the boards that change, in one message. `artboard-reader` is no use here —
   step 3 edits this source, so it has to be in this window. ponytail: the read is as
   narrow as it gets instead.
3. Copy each to its canvas path under **one** scratch root and edit it there. Never edit
   the file the read saved; never edit through a shell one-liner you cannot re-read.
4. **One** publish call: `url` the canvas, `root` that folder, `file_path` the full path
   of one board, the rest in `files` keyed by their `project/…` paths.
5. Send `project/canvas.json` **only** when the layout changes — a board added, removed,
   moved, resized or retitled, or the notes touched. A copy change never sends it.
6. Comment on the ticket: which boards changed and what changed on them. Then close it.

## Rules that bite

Each of these fails silently — the board renders wrong, or not at all, with no error.

- Keep the `<script src="./support.js"></script>` head line exactly as it is.
- The root element's fixed width and height must equal the board's `w`/`h` in
  `canvas.json` **and** the `$preview` in its `data-dc-script` block. Changing a board's
  height means changing all three, and that is a layout change, so the index goes too.
- Real `<a>`, `<button>`, `<input>` + `<label>`, even in a static mockup. A clickable
  `div` is skipped by Tab. Icon-only controls get an `aria-label`.
- 44px minimum targets, text at 4.5:1. The tertiary greys `#8D8B83` and `#6E6D68` already
  fail at 10–11px and are recorded as a deviation — do not reach for them.
- Anything invented is marked `PLACEHOLDER` in the board's header comment, as note `n3`
  on the canvas promises.
- Do not verify afterwards unless asked: no screenshot, no render, no read-back pass.
  Written is done.

## Both breakpoints

`Main`/`MobileHome`, `Menu`/`MobileMenu`, `Horses`/`MobileHorses`,
`HorsesGrid`/`MobileHorsesGrid`, `HorseDetail`/`MobileDetail`, `Footer`/`FooterMobile`.
`EN-Opening`, `EN-Horse` and `EN-Enquiry` are English states of three screens, not twins
of every screen — check whether the change reaches them rather than assuming either way.

## When code and canvas deliberately differ

Write the line under "Decisions made along the way" in `.claude/tickets/INDEX.md`, as the
tertiary greys and the homepage scrim already do. A deviation nobody wrote down reads as
a bug to the next person, and gets "fixed" back.
