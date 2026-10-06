# E4.19 · Scroll cue on the horse page hero — #176

Status: shipped 2026-10-06 (pull request #178)

## 2026-10-06 — redesign after owner review

- The owner rejected the first cut, a small cue at the hero's foot: "I don't like it, let's try showing it bigger in the middle of the photo darkening the photo a bit after some time if the user is still on top and hasn't scrolled".
- Rebuilt as a large cue centred on the photo over a 40% veil. Both fade in after 4 s for a visitor still at the top, and leave for good on the first scroll. Canvas v67 (`1791298237-9abe`) draws it revealed on the four horse detail boards; the foot cue and the 390 text lift from v66 are gone.
- `npm run ci` green. Inline JS on the horse page is 1.86 KB of the 4 KB budget.

## 2026-10-06

- Plan approved; approach comment posted on #176. Branch `176-e419-scroll-cue-on-the-horse-page-hero`, worktree `e4-19`.
- First cut built, ci green, canvas v66, PR #178. ticket-reviewer flagged "artboards not updated"; rebutted, because the canvas is not in git.

## What was built — 2026-10-06

- `HorseDetail.astro`: `.hero-veil`, an `inset: 0` layer before `.hero-text` (so the text paints above it), holds `<a class="hero-cue" href="#details">`. The link is 96×96 with a 48×66 SVG of three chevrons, `aria-hidden`, and a visually hidden `detail.scrollCue` label. `<SubBar id="details">` is the target, through a new optional `id` prop on `SubBar.astro`.
- Reveal: an inline script adds `.cue-on` to `.hero` after 4 s, unless the page has scrolled. Its first `scroll` event (`once`, passive) removes `.cue-on` for good, which covers a back-button scroll restore and the cue's own jump. CSS transitions `opacity` and `visibility` over 0.8 s, so the hidden link is out of the tab order until it shows.
- Veil `rgb(14 14 13 / 0.4)`. The chevrons carry `drop-shadow(0 0 8px rgb(14 14 13 / 0.6))` to hold 3:1 on a pale photo.
- Motion: the chevrons pulse with fade keyframes (`0%,100%` at 0.25, `40%` at 1) and negative delays (`-0.4s`, `-0.2s`, `0s`). Under reduced motion the global rule in `base.css` makes the loop static and the reveal instant.
- Smooth scroll is scoped to this page with `:global(html:has(.hero-cue))`, inside `prefers-reduced-motion: no-preference`.
- i18n: `detail.scrollCue` is "Przewiń do szczegółów" / "Scroll to details".

## Outcome — 2026-10-06

- Approach: the owner wants a cue that is delayed and aware of scrolling, which needs JS. The script is ~190 bytes; the link stays a plain anchor. Without JS there is no cue and the page reads as it did before. That reverses the ticket's original "works with JS off" criterion, and the issue body was updated to match.
- Rejected: the first cut (too small, at the foot, competing with the hero text), a JS button, site-wide smooth scroll, and a drift animation (the house rule is fades only).
- Surprise: the horse page has no sticky header (`header="overlay"` is `position: absolute`), so no `scroll-margin-top` is needed.
- Trap: headless Chrome does not advance CSS transitions under `--virtual-time-budget`. To screenshot the revealed state, add `--force-prefers-reduced-motion`. It also will not go below about 500px wide.
- Trap: animation base styles must be the visible state. The global reduced-motion rule shortens animations to 0.001ms and does not remove them.
- Trap: the reviewer cannot see canvas work. Log the canvas version here before review.
