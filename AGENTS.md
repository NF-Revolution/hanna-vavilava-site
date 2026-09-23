# hanna-vavilava-site

Sales site for Hanna Vavilava, show jumping horses near Warsaw. Built from the
artboard canvas "Hanna Vavilava — sales site". The site has one job: put an
enquiry in front of Hanna within an hour.

## Stack

Astro, static output, TypeScript strict. Plain CSS custom properties, no
framework, no CSS library, and no hydrated islands — public pages ship under
1 KB of JavaScript and it stays that way. The Realtime Database holds the horses and is
read at build time; the admin panel is the only client-rendered route.

## Conventions

- Every link goes through `path(locale, routeKey, slug)` in `src/i18n/routes.ts`.
  Nothing hardcodes a URL — the same table feeds the language switch and hreflang.
- Every user-visible string lives in `src/i18n/pl.json` and `src/i18n/en.json`.
  The two files are structurally identical; `src/i18n/index.ts` enforces it.
- Contact details and stock counts come from `src/site.ts`. Nothing else
  hardcodes a phone number.
- Values still to be replaced with real ones are marked `PLACEHOLDER`.
- Deliberate simplifications are marked `ponytail:` with the upgrade path.

## Design

Artboards: <https://claude.ai/artifact/F7qeoBwkyu2Dau5p1iLg2n> — the canvas named above.
Read it with the Artifact tool's `read` action, not WebFetch: `project/canvas.json` indexes
the boards (one per screen and breakpoint), `project/<Board>.dc.html` is one board's source.
The read returns the mechanics for writing back.

**Read the boards before building anything a visitor can see**, and build to them — the
canvas is the spec, and a ticket rarely repeats what a board already draws. Delegate that
read to the `artboard-reader` agent — read-only, Haiku, summary out, board source never in
this context — and keep its summary. `Explore` cannot stand in: it has no `Artifact` tool.

The canvas is the current design, not a record of the old one. **A change to public UI
changes its artboard too, in the same pull request** — new screen, new state, moved element,
changed component copy. Code that deliberately deviates gets a line under "Decisions made
along the way" in `.claude/tickets/INDEX.md`, as the tertiary greys and the homepage scrim
already have.

A decision that changes public UI but opens no pull request — an E0 ticket, an owner's
answer in a comment — files a design ticket instead, because the rule above only bites on
pull requests and the canvas is what everyone reads before building. The `artboards` skill
owns both halves: when a design ticket is owed, and how a board is actually changed.
Canvas work has no branch, no pull request and no `npm run ci`.

## Tickets

Work is tracked as GitHub Issues: milestones are epics (E0–E8), `epic:*` labels mirror them,
and blockers are written into the body as `**Blocked by** #N`. Two repo skills own the
mechanics — `ticket` creates and refines issues, `ticket-implement` picks one up, reads it
with all its comments, builds it and opens the pull request. Use them rather than improvising
`gh` calls, and start Claude from this directory so they load. The `issue-reader` agent
answers the wide questions those skills ask — which ticket is next, whether a ticket's
blockers are clear — on Haiku, so a hundred issue bodies never reach the main context. The `ticket-reviewer`
agent reads a finished diff with none of the build's context and reports only blocker,
critical and high findings, before the pull request opens.

Two different things live under `.claude/tickets/`, and they are not the same file twice:

- `.claude/tickets/INDEX.md` — the cross-ticket decision log and pointer. Which tickets are
  done, and the decisions taken along the way that no single ticket owns. It is not a second
  ticket system; GitHub Issues is the ticket system.
- `.claude/tickets/<E-code>/` — one folder per ticket, `E1.10` and not `15`, owned by the
  `ticket-notes` skill. While the ticket is open it holds `INDEX.md`, that ticket's plan map,
  `plans/NN-<slug>.md`, one plan per concern, and `followup.md`, the running log newest-first.
  Read the folder before planning and copy the approved plan into it before writing code.
  **When the pull request opens, finalize it**: the plans merge into `followup.md` as
  `## What was built`, the outcome goes below that, and `INDEX.md` and `plans/` are deleted in
  the same commit. A shipped ticket is one file — the scaffolding answered "which plan covers
  what" while we were building and answers nothing afterwards, and git history keeps it.
  `.claude/tickets/E1.10/` is the worked example, in its finished shape.

## Commands

    npm run dev      # dev server
    npm run ci       # format check, types, build, internal link check
    npm run fonts    # re-download the webfonts and regenerate fonts.css
