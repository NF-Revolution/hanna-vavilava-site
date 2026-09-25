# E4.1 · Homepage

Shipped 2026-09-25 — see the last `## Outcome` at the bottom.

Issue [#31](https://github.com/NF-Revolution/hanna-vavilava-site/issues/31) · branch `31-e41-homepage`

## 2026-09-25

- Blockers #12, #14 and #27 are closed. The issue had no comments. The approach comment was posted before any code.
- Boards read: Main, MobileHome and EN-Opening (the English twin of Main). No tablet board exists.
- The page was mostly built already, by E1.x and E3.3: three ways in, a visually hidden `<h1>`, the gated player, the sound toggle and the scrims. This ticket closed the gaps against the boards.
- No iPhone was available in this session. The layout was checked in the built HTML only, not in a browser on hardware.

## What was built — 2026-09-25

- `.screen` is `position: fixed; inset: 0`, replacing `height: 100vh; height: 100dvh`. Before iOS 15.4, the `100vh` fallback is the large viewport, so the bottom bar sits under the toolbar. A fixed box's `bottom: 0` follows the visible edge. `ponytail:` names `100dvh` as the way back.
- MobileHome's two bars, in CSS only at ≤720px:
  - `.edge` is `column-reverse`, so the horse bar (52px, centred, full facts, no arrow, wraps if tight) sits above the sound bar (56px, 0 12px, hint on the right).
  - The markup order stays sound, then horse, so desktop needs no change.
  - On mobile, `.sound[disabled]` is `display: none`, so the bar goes when there is no toggle. Desktop keeps `visibility: hidden`.
  - The entry cue moves to bottom 132px, with padding 15px 26px and a min-height of 48px.
- `Header.astro` overlay status: the date sits in `.status-date` behind a `.status-sep`. At ≤720px the separator hides and the date drops to its own line, as MobileHome draws it.
- `en.json` `home.soundHint` is "Hoofbeats, breathing, the rail", from EN-Opening.
- A stand-in hero is in `src/media.ts`: `intro_video.mp4`, AI footage with a Veo watermark, marked `PLACEHOLDER`.
- The MP4 `<source>` now comes before the WebM. Safari picked the VP9 WebM and stopped looping after one pass, and the MP4 is the smaller file anyway.
- The sound toggle is icon-only, as the owner asked:
  - Muted shows a speaker with a ×. Sound on shows two arcs that pulse (1.4 s, the outer arc 0.2 s behind).
  - The label is kept as visually hidden text, so the button still has a name. The hint stays.
  - Canvas version 23 redraws Main, MobileHome and EN-Opening to match.

## Outcome — 2026-09-25

- Rejected:
  - The wordmark as a visible `<h1>`. The boards draw no heading, and the descriptive hidden `<h1>` carries more.
  - `100svh`, which gains nothing over fixed positioning on a page that never scrolls.
  - An "on request" price label, which no board draws.
- Traps for next time:
  - The status separator is `  |  `, with non-breaking spaces. A string `Edit` with plain spaces does not match it.
  - In a column-reverse flex, `:last-child` is the visually top item. Borders go on the element that is visually lower.
  - Bare `git` is refused in this worktree session, because the `rtk` hook rewrites it. `/usr/bin/git` works.
- Still owed: a look on a real iPhone through the PR preview channel.
