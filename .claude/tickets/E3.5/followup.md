# E3.5 · Gallery lightbox

Shipped 2026-09-25 — see the last `## Outcome` at the bottom.

Issue [#29](https://github.com/NF-Revolution/hanna-vavilava-site/issues/29) · branch `29-e35-gallery-lightbox`

## 2026-09-25

- Blocker #25 closed. Approach comment posted on #29 before code.
- Plan 01 approved: one `Gallery.astro`, every photo pre-rendered hidden in one `<dialog>`, no src swapping.
- Verified with a stand-in: `photoUrl` pointed at picsum, a scratch page, and headless Chrome driven over CDP.
  - A click opens the dialog, and ArrowRight and ArrowLeft wrap around.
  - Escape closes the dialog, focus lands on the thumbnail of the last photo viewed, and `overflow` is cleared.
  - No dialog `<img>` is fetched before the dialog opens. After opening, only the photo on show is fetched.
  - Screenshots at 1440 and 390 match the board.
  - The stand-in was reverted.
- Public JS on a page with the drawer and the gallery: 962 B before trimming the gallery script (NodeList, not a spread, and `style.overflow`). That is under 1 KB, but only just.
- `npm run ci`: the format check fails on `.claude/skills/ticket-implement/SKILL.md`. That failure is already on `main` (the `ci` run at 2d4571d is red), and this ticket does not touch the file. Types, build, links and a11y are green.
- ticket-reviewer: clear, all four criteria met.

next: none — shipped.

## What was built — 2026-09-25

**Problem.** The horse detail page needs a gallery lightbox: a `<dialog>`, arrow keys, focus restore, and plain links to the full images with no JS. The boards (HorseDetail, MobileDetail) show:

- a 2-column grid with a 2px gap, with tiles 470px tall on desktop and 190px on mobile;
- an overlay at `rgba(14,14,13,0.94)` with an image box of at most 1120×700 and a bordered "Zamknij podgląd" button 28px below it;
- no prev/next controls, no counter, and no mobile open state.

**Steps.**

1. `src/components/Gallery.astro` takes `photos` and `locale`. It is not mounted yet: E4.5 (#35) places it, with the "Galeria" h2.
2. The grid is `<ul>` of `<a class="gallery-thumb" href>` around `<Photo sizes="50vw">`, with the image set to `object-fit: cover`.
3. `href` is `getImage({ src: photoUrl(key), inferSize: true, format: 'webp' })`, a full WebP built into `dist/`. It never points at the bucket.
4. `<dialog id="hv-gallery">` holds each photo again as a `<figure hidden>` with a lazy `<Photo>` and a figcaption `NN · caption`. The slides container is `aria-live="polite"`. The close button is a `form method="dialog"` button.
5. The script works like `MenuDrawer.astro`:
   - a click calls `showModal` and sets body `overflow: hidden`;
   - on `keydown`, ArrowLeft and ArrowRight call `show(at ± 1)` and wrap around;
   - on `close`, it clears the overflow and runs `thumbs[at].focus()`.
6. `gallery.preview` and `gallery.close` go in both locales.
7. `.claude/tickets/INDEX.md` gets a state row and a decision line: the caption goes in the lightbox, not over the thumbnail.

**Acceptance.** Dialog element · arrow-key navigation · focus restore · no-JS links to the full images. All met.

## Outcome — 2026-09-25

**Approach.** Every full image is pre-rendered hidden inside the dialog. A hidden figure in a closed dialog is not rendered, so its lazy `<img>` is never fetched until that figure is shown. The script only toggles `hidden`: it swaps no `src`, every `<img>` keeps its real width and height, and each full image keeps a srcset.

**Bugs met.** None.

**Rejected.**

- One dialog `<img>` whose `src` the script swaps: more JS, no srcset, and no size in the markup.
- Linking the raw Storage URL, which the bucket decision rules out.
- Prev/next buttons and swipe: not drawn. They are the `ponytail:` upgrade.
- `closedby="any"`: the dialog is full screen, so there is nothing outside it to click.
- Mounting the gallery in the detail stub. That is E4.5's job.

**Traps for next time.**

- `.lightbox figure { display: flex }` overrides the UA's `[hidden]`, so the component restates `figure[hidden] { display: none }`. Remove that line and every photo shows, and every photo downloads.
- Safari does not focus a clicked link, so native dialog focus restore lands on `<body>`. That is why the focus call is explicit.
- JS budget: the drawer (364 B) plus the gallery (under 600 B) comes close to 1 KB. The E4.x video facade will not fit beside them without trimming or a budget exception.
- Picsum redirects to `fastly.picsum.photos`, so the stand-in needs both domains.
- The worktree hook refuses `sed` and `gh` with runtime variables in one command. Split them, or use literal paths.

**Files that mattered.** `src/components/Gallery.astro`, `src/components/MenuDrawer.astro`, `src/components/Photo.astro`, `scripts/check-a11y.mjs`.
