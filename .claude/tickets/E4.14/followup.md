# E4.14 — followup

Shipped 2026-10-05 — see the last `## Outcome` at the bottom.

## 2026-10-05

- Plan 01 approved. Both live covers are 1280 × 853. Red Bull's nose is 8% from the left edge, so the board's 880 × 700 slot (1.26:1) already cut it at 1440.
- Before and after screenshots at 7 widths with real covers: https://claude.ai/artifact/SyJQ3EGg7ztiMz4Xfv1Lxi. The owner approved, and the approach comment is on #160.
- Canvas v58: `Horses` rows 587/667 (board h 3928), `MobileHorses` photo 390 × 260 (board h 4340), `canvas.json` heights updated.
- `npm run ci` green. ticket-reviewer: clear. AC 8 (owner checks on a phone and in a narrowed window) stays open until the merge.

## What was built — 2026-10-05

Issue #160. Plan: the photo sets the row height, rows stack at 1024, and the list uses no phone cover.

1. `src/components/HorsesIndex.astro` is the only source change:
   - `.fig img` is `width: 100%; height: auto`. Gone: `height: 100%`, `object-fit: cover`, `.entry { min-height: 700px }`. `.entry` has `align-items: center`.
   - A new `@media (max-width: 1024px)` block holds the single column, `'fig' 'text'`, and text padding `40px var(--gutter) 56px`. The 720 block keeps the phone type, the hidden `.nr` and `.as-of`, and the phone padding, and loses `grid-template-rows: 420px auto`.
   - `sizes` is now `(max-width: 1024px) 100vw, …`.
   - A `ponytail:` comment notes that a portrait cover would make a tall row.
2. Canvas: `Horses` and `MobileHorses` redrawn to the new photo sizes.

## Outcome — 2026-10-05

**Approach:** Uncropped photo at its own shape, so the row grows from the photo. A 3:2 cover is 880 × 587 / 1000 × 667 at 1440 and 390 × 260 at 390. Rows stack at 1024 and below.
**Bugs met:** The 1440 board slot itself clipped Red Bull's nose. The bug was not only at narrow widths.
**Rejected:**

- A fixed `aspect-ratio: 3 / 2`: it crops a 4:3 or 16:9 upload.
- Keeping 880 × 700.
- A focal point.
- A letterbox (#149).
- The phone cover on the list: a 9:16 photo fills a whole screen per horse, and today's phone covers are head shots.

**Traps for next time:**

- In `astro preview` the list is `/konie`. `/konie/` returns 404 there.
- `astro preview` daemonises; stop it with `astro preview stop`.
- The fixture has a single listed horse. To see the 4-row rhythm, add 3 copies with live keys temporarily, then revert.
- A worktree-isolated session refuses shell loops. Put them in a script under `$CLAUDE_JOB_DIR/tmp` and run that.
- An Artifact `root` must sit under the worktree: `node_modules/.<name>` is ignored and works.

**Files that mattered:** `src/components/HorsesIndex.astro`, `src/components/Photo.astro` (it writes the `width`/`height` that `height: auto` relies on)
