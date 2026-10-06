# E4.20 (#179) — round 2 on PR #181: horse page UI rework

## Context

Owner reviewed the preview: "UI looks like shit".

- Facts columns are misaligned: the right column's rows are taller because of their links, and "Dla kogo" hangs alone below the left column.
- The gallery grows with every photo.
- The video strip of 85% cards is wrong.

Wanted:

- "Dla kogo" folded into the facts.
- Gallery = one big photo + one **scrollable strip** of thumbs below. Any click opens the existing full-screen viewer at that photo.
- Videos = one big player + a scrollable strip of previews below.
  Same branch, same PR. The ticket gets reopened (ticket-notes §5).

## Approach

### Facts — `src/components/HorseDetail.astro`

- One `<dl class="grid" style="--rows:N">`: `display:grid; grid-template-columns:1fr 1fr;
grid-template-rows:repeat(var(--rows),auto); grid-auto-flow:column; column-gap:80px`.
  Both columns share row tracks, so paired rows line up whatever their height. The DOM order
  stays left column first, right column second, so 390 stacks in reading order.
- Rows: left = pedigree, breeding, trainingLevel, level, lastStart, starts (with the livejumping
  link). Right = **suits** (new row "Dla kogo"; the `<dd>` holds a `<ul>`, one item per line; omitted
  when empty), location (Dojazd), documents, price, sale. `N = ceil(rows/2)`.
- Rules: `border-bottom` on every row; `border-top` on the first cell of each column
  (`:nth-child(1)` and `:nth-child(N+1)`, set via the same var), so both columns start on a line.
- The separate Suits section goes, along with `.list` if nothing else uses it.
- Health uses the same grid: vaccinations, knownIssues | xrays. The two `dl`s and `.cols` go
  where unused.
- 390: one column, `grid-auto-flow: row`, rows auto.

### Gallery — `src/components/Gallery.astro`

- Markup: one big `a.gallery-thumb` (photo 0, ~620px tall desktop / 260px at 390, `sizes`
  100vw) + `<ul class="strip">` of `a.gallery-thumb` for photos 1… (desktop 160×110, 390 96×72,
  `overflow-x:auto`, `scroll-snap-type:x`, `tabindex=0` + aria-label when it overflows). The
  thumbs stay in photo order, so the script's `querySelectorAll('.gallery-thumb')[i]` →
  slide `i` mapping holds and **the script is unchanged**. No JS: every link still goes to the
  full image.
- Header comment updated; the 2-col grid CSS deleted.

### Videos — `HorseDetail.astro` + `Video.astro`

- Stage: every `<Video>` wrapped in `<div class="clip" id="clip-N">`. CSS hides every clip except
  the `:target` one, or the first when none is targeted
  (`.stage:not(:has(.clip:target)) .clip:first-child`). `scroll-margin-top` keeps the heading in
  view after the jump.
- Previews (only when >1 clip): `<ul class="strip">` of `<a href="#clip-N">` holding a poster
  thumb (`getImage` 320w webp from `media.base/posterKey`, `inferSize`), the title and the clock
  `m:ss`. Same strip CSS as the gallery: one shared rule in HorseDetail, with the gallery's own
  in Gallery.
- Inline script ~120 B: on `hashchange`, pause every `.stage video`, because a hidden clip keeps
  playing its sound. ponytail: no active-thumb highlight, since `:target` cannot reach a sibling
  link generically. Add per-index rules or JS if it is missed.
- `.reel` CSS deleted. Video stays 100% width, max-height 640.

### Boards

Delegated, inherit model. Edit `HorseDetail.dc.html` + `MobileDetail.dc.html` on top of v68:

- facts grid with the Dla kogo row
- no Dla kogo section
- big photo + thumb strip
- big video + preview strip
- health 2|1 grid
  Publish root = `.canvas-tmp/` inside the worktree (the job tmp was refused last time), deleted
  after. Plain read before publish.

### Ticket ritual

Reopen `.claude/tickets/E4.20/followup.md`: status `Reopened`, new `INDEX.md` +
`plans/01-ui-rework.md`. Finalize again at the push, then a short comment on #181.

## Verification

- `npm run ci` + `npm test`.
- Local build with the live horses swapped into the fixture: lotus-blue has 2 clips (previews,
  `:target` swap) and red-bull/cascada have photos. Check the dist HTML for the order and the strip markup, then
  restore the fixture.
- Inline-JS budget: check-links/a11y pass, and the pause script stays tiny.
- Preview channel on #181: owner walks desktop + 390.
- `ticket-reviewer` again (bigger than a few lines), then push and comment on the PR.
