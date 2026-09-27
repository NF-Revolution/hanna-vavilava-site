# E4.8 — followup

Shipped 2026-09-27.

Issue [#38](https://github.com/NF-Revolution/hanna-vavilava-site/issues/38) ·
branch `38-e48-390px-mobile-pass` · canvas `F7qeoBwkyu2Dau5p1iLg2n`

## 2026-09-27

- All blockers (#31–#37) are closed. The approach is posted on #38.
- The page tickets had already built each page's 390 layout. The only unbuilt 390 element was the
  persistent WhatsApp + form bar from `MobileHorses`, `MobileHorsesGrid` and `MobileDetail`.

## What was built — 2026-09-27

- `src/components/MobileBar.astro`: sticky bottom bar, ≤720px only, mounted by `Page.astro` when
  a page passes `bar` (the WhatsApp href). It is on the horses index, the grid and a live detail
  page, where it carries the per-horse prefilled `wa.me` link. The detail hero CTA is hidden at
  ≤720px, as `MobileDetail` draws.
- `bar.whatsapp` / `bar.form` strings in both locales.

## Outcome — 2026-09-27

- Sticky, not fixed. As the last element before the drawer, the bar parks under the footer, so
  it never covers the language switch.
- Audit method: `astro preview`, headless Chrome over CDP, `Emulation.setDeviceMetricsOverride`
  390 × 844 mobile, then `scrollWidth` plus every element's rect per route. A plain
  `--headless --window-size=390` screenshot lies: it lays the page out wider and crops it, so it
  looks like overflow when there is none.
- Not done: the "Zgłoś wymagania" demand form on `MobileHorses`, which belongs to the forms epic.
  The 16px vs 20px gutter mix across the boards was left as each page ticket chose.
