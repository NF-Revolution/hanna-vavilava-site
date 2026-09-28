# E6.1 — followup

Shipped 2026-09-28.

Issue [#50](https://github.com/NF-Revolution/hanna-vavilava-site/issues/50) ·
branch `50-e61-head-component`

## 2026-09-28

- Blocker #57 is closed. The approach is posted on #50. No board read: head tags are drawn on no board.
- `Base.astro` already emitted the title, description, canonical, hreflang with x-default, `og:*` and
  `twitter:card` from the scaffold, so the ticket closed gaps rather than building a component.

## What was built — 2026-09-28

- `src/layouts/Base.astro`: `og:locale:alternate` for the other locale, only on indexable pages.
  One `ogLocale` map feeds both it and `og:locale`.
- `src/components/HorseDetail.astro`: the description is `horse.headline[locale]`. Before, it was the horses
  index blurb, so every horse had the same snippet and preview text.
- `scripts/check-links.mjs`: a head pass over `dist/`, skipping `noindex` pages. It checks for one
  title, one description, one canonical in its own hreflang set, that every hreflang target exists,
  and that each target's hreflang set is the same one.

## Outcome — 2026-09-28

- Rejected: a separate `Head.astro`, which would only move lines. Also an `image` prop with no caller:
  E6.2 (#51) adds it together with the per-horse card. Also the `twitter:*` duplicates, because X
  falls back to `og:*`.
- Trap: the fixture's horse headlines are `PLACEHOLDER`, so a local build shows
  `description="PLACEHOLDER"` on horse pages. Live data carries the real headlines.
- Trap: `dist/404.html` contains `hreflang="en"`. It comes from the language-switch anchor,
  not a `<link>`, and the head pass skips the page anyway because it is `noindex`.
- Proof the check bites: delete `dist/en/about/index.html` and run `npm run links`. It fails with
  `dist/o-mnie/index.html -> hreflang https://…/en/about`.
- Not done: a default share image for the pages that are not horses. It is not designed, and it
  gets a ticket if the owner wants one.
