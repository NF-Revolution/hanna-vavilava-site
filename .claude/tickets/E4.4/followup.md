# E4.4 — followup

Shipped 2026-09-25.

Issue [#34](https://github.com/NF-Revolution/hanna-vavilava-site/issues/34) ·
branch `34-e44-horse-detail-page` · canvas `F7qeoBwkyu2Dau5p1iLg2n` version 26

## 2026-09-25

- Blockers #17 and #25 are closed. The approach is posted on #34. The body is corrected: the
  X-ray label follows #71, and the event criterion is now a `data-event` hook, because no
  analytics provider exists before #55.
- Two `artboard-reader` passes. The first one was coarse, and the second, narrow one asked for
  px values and got them.
- `git` through the rtk hook is refused in this worktree. Use `/usr/bin/git`.
- Built, CI green, `ticket-reviewer` clear.

## What was built — 2026-09-25

- `HorseDetailStub.astro` became `HorseDetail.astro`: one component for both locales and both
  states. The hero is 900px (390: 844px, capped at `100svh`), with the photo and the overlay
  header. The name is the h1. Price and CTA sit bottom-right and fade in late. After the hero
  come the breadcrumb sub-bar, the facts (7 + 7 rows, Cena and Sprzedaż last), suitability,
  health with the X-ray row and the vet note, viewing in three columns, and three other horses.
- Sold: the hero with the sold label, the sub-bar, the existing band and the other horses.
- Seams: `Page` takes `header: 'overlay'`, `Header` takes `status`, and `SubBar`'s `label` is
  optional, since the hero owns the h1.
- `formatSize()` in `format.ts`. New `detail.*` strings in both locales, and
  `pages.horses.description` now says the X-rays are downloadable.
- Canvas v26: `HorseDetail` (h 7057) and `MobileDetail` (h 5885) gained the Cena and Sprzedaż
  rows and the "Zapytaj o klacz Cascada" copy; `canvas.json` got the heights.
- `<!-- E4.5 (#35) -->` markers for the two videos and the gallery, and `<!-- E5.2 (#41) -->` for
  the enquiry block.

## Outcome — 2026-09-25

Built as planned, with five deviations logged in `.claude/tickets/INDEX.md`: the hero scrim, the
CTA copy by sex, the price-only sub-bar, the CTA kept in the 390 hero, and the overlay header's
top scrim. Review clear.

- Rejected: the sale kind under the hero price, an `aria-label` on the X-ray link, a Polish
  accusative name field, and per-section components.
- Trap: headless Chrome's window is at least 500px wide, so a `--window-size=390` screenshot
  crops a 500px layout and looks like overflow. Use device emulation or a real 390 viewport.
- Trap: a screenshot taken at load hides the price and CTA (`fade-late`). Pass
  `--virtual-time-budget=5000`.
- Trap: the canvas publish is refused as stale until the canvas has been read with a plain
  `read` (url, no path) and a `scope: "files"` listing, even when the version id is unchanged.
- Not built, owned elsewhere: the videos and the gallery (#35), the enquiry block (#40/#41), and
  the 390 sticky WhatsApp bar (#38/#47). Once that bar exists, drop the CTA from the 390 hero.
