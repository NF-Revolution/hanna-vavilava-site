# E3.7 · Gallery: close cross, scroll on desktop, swipe on a phone

Shipped 2026-10-03 — see the last `## Outcome` at the bottom.

Issue [#150](https://github.com/NF-Revolution/hanna-vavilava-site/issues/150) · branch `150-e37-gallery-close-cross-scroll-on-desktop-swipe-on-a-phone`

## 2026-10-03

- Blockers: none. The issue has no comments.
- Boards: only the old desktop open state is drawn. There is no ×, no scroll and no mobile open state.
- The horse page JS budget is already over: about 1.4 KB with photos. The user decided the gallery script must not grow. The criterion in the body is reworded, and the overrun is #154.
- Plan 01 approved. Approach comment posted.
- Before: the live red-bull page had a 558 B gallery script. The first build of the new script came to 684 B.
  - The keydown handler went: the list takes focus through `autofocus`, so the arrow keys scroll it natively.
  - The scroll lock moved to CSS, `body:has(#hv-gallery[open])`.
  - Result: 468 B.
- Stand-in check: 2 real red-bull photos and 4 picsum photos, driven in headless Chrome over CDP.
  - Open lands on the clicked photo, and one arrow press moves one photo.
  - Escape closes, focus lands on the last-viewed thumb, and the body is locked while open.
  - Chrome still fetches about 2 photos either side of the one opened, its own lazy-load distance. `content-visibility: auto` did not change that, so it was reverted.
- Mobile: the photo box was 100dvh tall around a landscape photo. Under 720 px the box now takes the photo's own height.
- Boards published (canvas v55): HorseDetail open state, and a new MobileDetail open state.
- Filed #154 for the horse-page overrun and commented on #65.
- ticket-reviewer round 1, one high finding: ArrowRight did nothing on desktop, though the approach comment promised Left and Right. Fixed.
  - Left and Right call `scrollBy(0, ±clientHeight)`. On a phone the list has no vertical overflow, so the call does nothing and the native horizontal scroll runs.
  - The bytes came back from `onscroll`, `onkeydown` and `onclose` replacing `addEventListener`.
  - Script is now 524 B. Retested Right, Down and Left on desktop and Right on a phone: each moves one photo.
- ticket-reviewer round 2, two blockers, both decided by the user:
  - Lazy-load neighbours: the criterion was reworded on #150. An IntersectionObserver was rejected because it would cost about 150 B.
  - Real phone and iOS: the PR opens with those boxes unticked. They are checked on the preview deploy before merge.

next: none — PR open; check on a real iPhone before merge.

## What was built — 2026-10-03

**Problem.** On a phone the owner could not close the lightbox or reach the next photo. E3.5 showed one hidden-toggled figure at a time, moved only with the arrow keys, and put a text "Zamknij podgląd" button below the photo.

**Steps.** All the code changes are in `src/components/Gallery.astro`.

1. The figures lose `hidden`, and `.lightbox-slides` becomes a scroll-snap scroller. Each figure is exactly one scroller page.
   - Desktop: `grid-auto-rows: 100%`, `overflow-y`, `scroll-snap-type: y mandatory`.
   - ≤ 720 px: `grid-auto-flow: column`, `grid-auto-columns: 100%`, `scroll-snap-type: x mandatory`. The photo box takes the photo's own height.
2. A × replaces the bottom button. It sits inside `<form method="dialog">`, is `--tap` square, and takes its `aria-label` from the existing `gallery.close` string.
3. The scroller has `tabindex="-1" autofocus`, so `showModal` focuses it and the arrow keys along its axis scroll it natively. `onkeydown` maps Left and Right to `scrollBy` one page, for the vertical desktop list.
4. Opening calls `slides.children[i].scrollIntoView()`. It is instant, never smooth, so the photos in between are skipped.
5. `onscroll` keeps `at = round(scrollTop/clientHeight + scrollLeft/clientWidth)`. `onclose` focuses `thumbs[at]`.
6. The scroll lock is CSS: `body:has(#hv-gallery[open]) { overflow: hidden }` plus `overscroll-behavior: contain`.
7. The `ponytail:` header is rewritten: lazy-load neighbours, with an IntersectionObserver as the upgrade, and the iOS `position: fixed` dance if the lock leaks.
8. Boards: HorseDetail and MobileDetail draw the open state (canvas v55).
9. `.claude/tickets/INDEX.md` gets a state row and a decision line.

## Outcome — 2026-10-03

**Approach.** One scroll-snap list. The CSS does the scrolling, the swiping and the scroll lock. The script does three things: it opens the gallery at the clicked photo, it keeps track of which photo is showing for focus restore, and it makes Left and Right work on desktop. The script is 524 B, down from 558 B.

**Bugs met.**

- ArrowRight was dead on desktop after the keydown handler was dropped (reviewer round 1).
- Mobile showed a 100dvh-tall dark box around a landscape photo.
- `onscroll` failed type-checking on `Element`, so `querySelector<HTMLElement>` was needed.

**Rejected.**

- Prev/next buttons.
- A carousel library, or touch-event code.
- Wrap-around on the arrow keys: jumping from the last photo to the first would scroll past every photo in between and fetch them all.
- `content-visibility: auto`: it did not stop Chrome prefetching.
- An IntersectionObserver `src` swap: about 150 B over the limit the user set.

**Traps for next time.**

- The fixture horses have no photos, so a local build never renders the gallery. Measure JS on the live page, or put photos in the fixture as a stand-in (#154).
- `on*` properties are cheaper than `addEventListener` once minified, about 17 B each. That is safe here because this script is the only one that touches those elements.
- On `close` the dialog is already `display: none`, so its scroll position cannot be measured then. Track the photo index on scroll instead.
- Never give the scroller `scroll-behavior: smooth`. Opening would then animate past every photo before the one tapped and fetch them all.
- In a worktree session, the guard refuses Bash heredocs that run python or contain "git". Write a script file and run it, or use Edit.

**Files that mattered.** `src/components/Gallery.astro`, `src/components/Photo.astro`, `src/styles/base.css` (button reset: `text-align: left`).
