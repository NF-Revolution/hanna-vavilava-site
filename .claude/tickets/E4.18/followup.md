# E4.18 — followup

Shipped 2026-10-06. See the last `## Outcome` at the bottom.

Issue [#172](https://github.com/NF-Revolution/hanna-vavilava-site/issues/172) ·
branch `172-e418-whole-horse-entry-on-the-horses-list-opens-the-horse`

## 2026-10-06

- Plan 01 was approved. The issue has no blockers and no comments.
- Board read: the four boards drew only the base focus ring and the grey `a:hover`. There was no zoom, no entry outline and no touch CTA.
- `npm run ci` is green. Click targets were checked in headless Chrome with JS off, at 1440 and 390, in both locales. Each part of an entry hits its own link and has one tab stop. A blurb click opens the horse.

## What was built — 2026-10-06

- `HorsesIndex.astro`: `.entry` is `position: relative`, and `.more::after` stretches over it with `inset: 0`. It is still one link, named "more: <horse>".
  - Hover anywhere is `.more:hover`. The text greys through the base `a:hover`, and a box-shadow doubles the rule to 2px.
  - The photo zooms to 1.03 only under `(hover: hover) and (prefers-reduced-motion: no-preference)`, on hover or on `:has(.more:focus-visible)`.
  - Focus draws a 2px inset outline on `::after`, around the whole entry.
  - Under `(hover: none)`, "more" is an outlined full-width bar.
- `HorsesGrid.astro`: the same zoom on `.card:hover` / `.card:focus-visible`, and the name underlines on hover. Focus keeps the base ring.
- Canvas v62:
  - `Horses`: entry 02 is in hover and entry 03 in focus.
  - `MobileHorses`: every "Karta konia" is the outlined bar, and entry 02 is in focus.
  - `HorsesGrid`: card 02 is in hover and card 03 in focus.
  - `MobileHorsesGrid`: card 02 is in focus.
  - Each state carries a `Stan: …` caption on the photo.

## Outcome — 2026-10-06

- **Approach:** a stretched link in CSS, with no markup change and no script.
- **Rejected:**
  - Wrapping the entry in one `<a>`, because the whole entry would become the link name.
  - JS click delegation, because the page must have no script.
  - Separate state boards, as four boards for two small states.
- **Traps:**
  - The overlay covers the blurb, so its text cannot be selected. This is marked `ponytail:` in the code, with the way to lift it.
  - `.more` must stay unpositioned, or `::after` shrinks to the link.
  - An outer focus ring falls off-screen on the edge-to-edge list, which is why the outline is inset.
  - The grid card is still one `<a>` whose name is the whole card. That is untouched here.
