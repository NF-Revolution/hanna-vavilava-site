# E6.5 — followup

Shipped 2026-10-02.

Issue [#54](https://github.com/NF-Revolution/hanna-vavilava-site/issues/54) ·
branch `54-e65-icons-and-manifest`

## 2026-10-02

- Blocker #12 is closed. No board drew a mark. The site was shipping Astro's default favicon.
- The owner first picked an HV monogram, then supplied their own logo (`hv_logo_final.svg`). The logo won.
- The approach is posted on #54. The `Icons` board was added to the canvas (v44).

## What was built — 2026-10-02

- `src/assets/logo.svg` is the owner's file, unchanged. `src/assets/logo-mark.svg` is the same file
  with the first path (the wreath) removed and the viewBox cropped to `339 310 371 361`, the horse's bounds.
- `src/icons.ts` holds the size table and `svg()`. `svg()` nests the logo as an inner `<svg>` on a
  `#0E0E0D` square and recolours its fill to `#F2F1ED`. `pad` is in hundredths of the side:
  4 for the favicon, 8 for the app icons, 14 for the maskable icon.
- `src/pages/[icon].ts` builds `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`,
  `icon-512.png` and `icon-maskable-512.png`. The PNGs come from sharp. The ICO is a 22-byte header
  around the 32 px PNG.
- `src/pages/manifest.webmanifest.ts`: the name and description come from `brand` in the default
  locale, `start_url` from `path()`, and it sets `display: browser` and `#0E0E0D` for both colours.
- `Base.astro` adds four head links: icon ico, icon svg, apple-touch-icon and manifest.
  `public/favicon.*` are deleted. `sharp@^0.35.4` is declared, the version already locked.

## Outcome — 2026-10-02

- `npm run ci` is green. `file` confirms the ICO is "1 icon, 32x32 with PNG image data".
  A contact sheet showed the 32 px horse readable and the maskable wreath inside the 80% circle.
- Rejected: the HV monogram (the real logo arrived), the full logo at favicon size, committed binaries,
  a static manifest in `public/`, and `display: standalone`.
- Trap: `svg()` recolours by replacing the literal `fill="#000000"` and the first `<svg `. A new logo
  file exported with another fill or an XML prolog renders black on black. Check the sheet after a swap.
- Trap: at 16 px the horse is a blob. That is the ceiling of a detailed logo; a simpler mark would need the owner.
