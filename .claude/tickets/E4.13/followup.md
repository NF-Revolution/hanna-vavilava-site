# E4.13 — followup

Shipped 2026-10-05 — see the last `## Outcome` at the bottom.

## What was built — 2026-10-05

- The public JavaScript budget is now 4 KB of a page's own inline JS, not 1 KB. 4 KB is
  Vite's default `build.assetsInlineLimit`, the size past which Astro gives a processed
  `<script>` a request of its own. Changed in `AGENTS.md` and
  `.claude/agents/ticket-reviewer.md`, in the `Video.astro` and `JsonLd.astro` comments,
  and under "Decisions made along the way" in `.claude/tickets/INDEX.md`. Noted on #154
  and #65.
- `cascada` in `src/fixture.json` has two photos, so a local build renders the gallery.
- `scripts/check-a11y.mjs` now counts a non-empty child `<img alt>` as a link's accessible
  name. The first build with the gallery flagged every gallery thumbnail without it.

## Outcome — 2026-10-05

The first checkbox was met by a decision, with no code trimmed. No ticket, comment, commit or
Astro doc gives a reason for 1 KB: the scaffold shipped 364 B, and `AGENTS.md` rounded it up.
The cascada page now carries 1 550 B of inline JS (gallery 524, Turnstile loader 337, form
325, drawer 364). The live build adds the 821 B beacon on top.

Traps for next time:

- The fixture photos are red-bull's live Storage objects, `photos/red-bull/8b1f2baa.jpg` and
  `c7856957.jpg`. If those are deleted, the local build fails at `getImage`. When that happens,
  point the fixture at another live horse's keys.
- The gallery had never been rendered locally before this change, so the a11y checker had
  never seen a link named only by its image. Any fixture gap like that hides a check failure
  until live.
