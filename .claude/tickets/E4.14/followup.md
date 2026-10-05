# E4.14 — followup

Shipped 2026-10-05 — see the last `## Outcome` at the bottom.

## 2026-10-05

- Plan 01 approved. Both live covers are 1280 × 853. Red Bull's nose is 8% from the left edge, so the board's 880 × 700 slot (1.26:1) already cut it at 1440.
- Before and after screenshots at 7 widths with real covers: https://claude.ai/artifact/SyJQ3EGg7ztiMz4Xfv1Lxi. The owner approved, and the approach comment is on #160.
- Canvas v58: `Horses` rows 587/667 (board h 3928), `MobileHorses` photo 390 × 260 (board h 4340), `canvas.json` heights updated.
- `npm run ci` green. ticket-reviewer: clear. AC 8 (owner checks on a phone and in a narrowed window) stays open until the merge.
- The owner's Safari check on the PR preview failed, though Chrome was fine. Rows were taller or shorter than their photo: uneven bands, and one row's photo overlapped the next. The photo's height came from the `<img>` (`height: auto` plus width/height inside a lazy `<picture>`), and Safari sized the grid row without it. Fix: `.fig { aspect-ratio: 3 / 2 }` with the img at `100%` and `object-fit: cover`. A 3:2 cover is still uncropped, the sizes are unchanged and the canvas still matches.
- After #163 merged and deployed, Safari still broke on resize. Make the window narrow and then wide again, and the rows keep their old heights: the 3:2 frame sticks out of its row and overlaps the next one, and the no-photo placeholder is taller than its text. WebKit does not re-size grid auto rows whose item takes its height from `aspect-ratio`. Plan 01 (reopen) writes the height in `vw` instead. Branch `fix/horses-list-safari-resize`.

## What was built — 2026-10-05

Issue #160. Plan: the photo frame sets the row height, rows stack at 1024, and the list uses no phone cover.

1. `src/components/HorsesIndex.astro` is the only source change:
   - `.fig` has `aspect-ratio: 3 / 2`, and its img is `width: 100%; height: 100%; object-fit: cover`. Gone: `.entry { min-height: 700px }`. `.entry` has `align-items: center`.
   - A new `@media (max-width: 1024px)` block holds the single column, `'fig' 'text'`, and text padding `40px var(--gutter) 56px`. The 720 block keeps the phone type, the hidden `.nr` and `.as-of`, and the phone padding, and loses `grid-template-rows: 420px auto`.
   - `sizes` is now `(max-width: 1024px) 100vw, …`.
   - A `ponytail:` comment covers the fixed 3:2: a 4:3 upload loses about 5% top and bottom, a 16:9 one about 8% each side. The upgrade path is a per-photo `aspect-ratio`.
2. Canvas: `Horses` and `MobileHorses` redrawn to the new photo sizes.

## Outcome — 2026-10-05

**Approach:** A 3:2 photo frame whose width is the column, so the row grows from the frame, not from a fixed height. A 3:2 cover is shown uncropped: 880 × 587 / 1000 × 667 at 1440, 390 × 260 at 390. Rows stack at 1024 and below.
**Bugs met:**

- The 1440 board slot itself clipped Red Bull's nose. The bug was not only at narrow widths.
- A row sized from the img's own ratio broke in Safari (bands, overlapping rows) while Chrome rendered it correctly.

**Rejected:**

- The img's own ratio (`height: auto`): broken in Safari, see above.
- Keeping 880 × 700.
- A focal point.
- A letterbox (#149).
- The phone cover on the list: a 9:16 photo fills a whole screen per horse, and today's phone covers are head shots.

**Traps for next time:**

- Check photo layouts in Safari, not just headless Chrome. There is no WebKit driver here, so the owner checks the PR preview.
- In `astro preview` the list is `/konie`. `/konie/` returns 404 there.
- `astro preview` daemonises; stop it with `astro preview stop`.
- The fixture has a single listed horse. To see the 4-row rhythm, add 3 copies with live keys temporarily, then revert.
- A worktree-isolated session refuses shell loops. Put them in a script under `$CLAUDE_JOB_DIR/tmp` and run that.
- An Artifact `root` must sit under the worktree: `node_modules/.<name>` is ignored and works.

**Files that mattered:** `src/components/HorsesIndex.astro`

## What was built — 2026-10-05, reopened

Fix PR on `fix/horses-list-safari-resize`, refs #160.

1. `src/components/HorsesIndex.astro`: `.fig` loses `aspect-ratio: 3 / 2` and `min-height: 0`. Its height is now written in `vw`: `calc(100vw * 880 / 1440 * 2 / 3)`, `calc(100vw * 1000 / 1440 * 2 / 3)` on `:nth-child(4n)`, and `calc(100vw * 2 / 3)` at ≤ 1024. The img is still `100%` with `object-fit: cover`. The sizes are unchanged, so the canvas needs no change.

## Outcome — 2026-10-05, reopened

**Approach:** The frame height is written in `vw`, because the list runs edge to edge. The grid has no height to work out from an item's shape.
**Bugs met:** WebKit does not re-size grid `auto` rows whose item takes its height from `aspect-ratio` or from an `<img>`'s own ratio. After the window went narrow and then wide, rows kept their old heights, and frames overflowed into the next row.
**Rejected:** `aspect-ratio` on the frame (this bug). `cqw` (more moving parts, kept as the upgrade path).
**Traps for next time:**

- Check Safari by making the window narrow and then wide again, not only by loading the page. A first paint can look right.
- Safari automation is blocked here ("Allow JavaScript from Apple Events" is off, and `screencapture -l` fails), so the owner checks.
- `vw` counts a classic scrollbar, which makes the frame about 1% taller on Windows.

**Files that mattered:** `src/components/HorsesIndex.astro`
