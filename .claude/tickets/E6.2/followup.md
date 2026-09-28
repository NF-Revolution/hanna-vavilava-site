# E6.2 — followup

Shipped 2026-09-28.

Issue [#51](https://github.com/NF-Revolution/hanna-vavilava-site/issues/51) ·
branch `51-e62-per-horse-link-preview-cards`

## 2026-09-28

- Blockers #50 and #25 are closed. The approach is posted on #51. The body had no checklist, so
  one was added before building.
- Board read: no board draws a share card. The detail hero draws a clean photo with its name and
  price as HTML layers. The owner chose photo only over a designed text card.

## What was built — 2026-09-28

- `src/components/HorseDetail.astro`: the first photo goes through `getImage` as a `fit: 'cover'`
  JPEG at quality 80. Its absolute URL, real size and alt go to `Page` as `image`. The sold page
  keeps the card.
- `src/layouts/Page.astro` passes `image` through. `src/layouts/Base.astro` emits `og:image`,
  `og:image:width`, `og:image:height` and `og:image:alt` only when it gets one.
- `scripts/check-links.mjs`: every og:image must be `https://`, must exist in `dist/`, and must be
  ≤ 300 000 bytes. `.github/workflows/preview.yml` now runs `npm run links`, as `deploy.yml` already did.

## Outcome — 2026-09-28

- Tested on two real horse photos served by the live `/konie/cascada` page, through a temporary fixture key
  that was never committed. A 1280 × 853 source gives a 1200 × 630 card of about 110 KB, and the whole
  horse stays in frame. The check bites: with the limit lowered to 50 000, `npm run links` fails
  on both locale pages.
- Trap: sharp never upscales. A 640 × 427 source first came out as 640 × 427 with no crop, while the
  tags claimed 1200 × 630. So the card now scales down to fit the source and keeps the 1.91:1
  shape, and the tags carry the size that was built. `inferRemoteSize` costs one header read per horse.
- Trap: the CI fixture has `photos: []`, so `npm run ci` never builds a card. To test locally,
  point a fixture photo at a real image. The key regex refuses a leading `_`.
- Trap: a preview channel's og:image points at `SITE_URL`, which is the live host. So the
  Facebook Sharing Debugger and a WhatsApp send can verify only after the deploy.
- Rejected: satori and resvg for a text card, a fixture photo in CI (it would put Storage on
  every CI run's network path), `twitter:image` (X falls back to og:*), and a focal point per photo
  (a `ponytail:` comment marks where to add one).
