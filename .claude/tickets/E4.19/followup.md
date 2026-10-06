# E4.19 · Scroll cue on the horse page hero — #176

Status: shipped 2026-10-06 (pull request)

## 2026-10-06

- Plan approved; approach comment posted on #176. Branch `176-e419-scroll-cue-on-the-horse-page-hero`, worktree `e4-19`.
- Built, `npm run ci` green (41 pages, links and a11y hold). Headless screenshots: Cascada (real photo) at 1440, 900 and ≤720; sold Norton at 1440 and ≤720. The cue is centred and clear of the text, the CTA and the MobileBar.
- Canvas version 66 (`1791297491-761c`): the cue is drawn on `HorseDetail`, `MobileDetail`, `HorseDetailSold` and `MobileDetailSold`. `EN-Horse` is a list entry, not the hero, so it is unchanged.
- ticket-reviewer flagged "artboards not updated" as a blocker. Rebutted: the canvas is not in git, so the diff cannot show it; version 66 is above.

## What was built — 2026-10-06

- `HorseDetail.astro`: `<a class="hero-cue" href="#details">` is the last child of `.hero-text`, in both variants. It holds a visually hidden `detail.scrollCue` label and one `aria-hidden` SVG with three chevron paths. `<SubBar id="details">` is the target, through a new optional `id` prop on `SubBar.astro`.
- CSS: the cue is absolute and centred, 44×44. On desktop it sits at `bottom: 8px`, inside the existing 56px padding, so the text did not move. At ≤720px a `--bar` custom property (81px + safe area, barred only) drives both the text padding `calc(68px + var(--bar, 0px))` and the cue's `bottom: calc(12px + var(--bar, 0px))`. This replaces the old `.hero-barred` padding rule.
- Motion: fade keyframes (`0%,100%` at 0.25, `40%` at 1) with negative delays (`-0.4s`, `-0.2s`, `0s`), so the chevrons pulse top to bottom with no flash at start. Under reduced motion, the global rule in `base.css` ends the animation on the base style: solid and static.
- Smooth scroll is scoped to this page with `:global(html:has(.hero-cue))`, inside `prefers-reduced-motion: no-preference`.
- i18n: `detail.scrollCue` is "Przewiń do szczegółów" / "Scroll to details".

## Outcome — 2026-10-06

- Approach: a plain anchor link plus CSS only, no JS. Rejected: a JS button, site-wide smooth scroll, and a drift animation (the house rule is fades only).
- Surprise: the horse page has no sticky header (`header="overlay"` is `position: absolute`), so no `scroll-margin-top` is needed.
- Trap: animation base styles must be the visible state. The global reduced-motion rule shortens animations to 0.001ms and does not remove them, so `fill-mode: both` or positive delays would leave the chevrons dim or flashing.
- Trap: headless Chrome will not go below about 500px wide, so a "390" screenshot is the ≤720 layout at about 500px.
- Trap: the reviewer cannot see canvas work. Log the canvas version here before review.
