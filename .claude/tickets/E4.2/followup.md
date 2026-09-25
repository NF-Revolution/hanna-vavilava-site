# E4.2 — followup

Shipped 2026-09-25 — see the last `## Outcome` at the bottom.

Issue [#32](https://github.com/NF-Revolution/hanna-vavilava-site/issues/32) ·
branch `32-e42-horses-index-editorial-view` · canvas `F7qeoBwkyu2Dau5p1iLg2n` version 22

## 2026-09-25

- Plan approved and approach posted on #32. Built, reviewed and shipped in one session.
- **The first `artboard-reader` summary was too coarse to build from.** It had no entry order,
  no link underline, no 26px gap, no mobile entry without a number, and no 04 padding. A
  second, narrower ask got the layout. The detail that was still missing only came out when
  the boards were read in full for the canvas edit. For layout work, read the board source
  itself.
- **At 390 the step-three entry inherited `align-items: center` from its desktop grid**, and
  its text centred. The fix is `align-items: stretch` in the mobile override. A fixture with
  only two horses, one of them sold, never shows steps 2–4. Test with a temporarily widened
  fixture (five horses, one with `price: null`), then restore it.

## What was built — 2026-09-25

- `site.horsesListed`: the sorted horses minus the sold ones, as `{ slug, ...data }`. #33's grid
  reuses it.
- `src/components/HorsesIndex.astro` serves both locales. Its entries form an `<ol>` in a
  four-step pattern chosen by `:nth-child(4n+k)`. The pattern is image left 880/560, image
  right 560/880, a full-bleed 500px image over a 200px row, and image right 440/1000. The
  cover is `photos[0]` through `Photo.astro` with `sizes` for each step. With no photo, the
  entry shows a `--placeholder` block.
- `SubBar.astro` gained a named `label` slot for the "Stan stajni na" date, hidden at 390.
- i18n: `pages.horses.asOf`, `more`, `onRequest`, `sex.{mare,gelding}`.
- Canvas v22: entry 04 on `Horses` and `MobileHorses` shows "Cena na zapytanie".

## Outcome — 2026-09-25

The design matches both boards except for four deviations logged in `.claude/tickets/INDEX.md`:
the `€` price, "Wszystkie konie" kept at 390, the undrawn empty stable, and the visually hidden
link names. The `ticket-reviewer` verdict was clear. Out of scope: the view toggle belongs to
#33, and the "Szukają Państwo czegoś innego?" form and the dark band belong to #41. Reserved
horses are listed with no marker, because no board draws a reserved state on the index.
