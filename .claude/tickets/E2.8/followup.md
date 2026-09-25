# E2.8 · Sold-horse handling

Shipped 2026-09-24 — #90. Verified live 2026-09-25.

## 2026-09-24 — build

- Canvas v18: `HorseDetailSold` (1440×2170, x 4560 y 3180) and `MobileDetailSold` (390×2130,
  x 9950 y 0) added. The first publish was refused as stale; `canvas.json` was unchanged
  (same sha), so the second went through.
- Code: sold band in `HorseDetailStub.astro`, `sold.*` + `admin.soldConfirm` strings, `functions/sold.js`
  - `tests/sold.test.mjs`, `deleteSoldXrays` in `publish`, a `confirm()` in the editor, and a sold
    `norton` in the fixture. `npm run ci` and `npm test` (30/30) are green.
- Trap: wrangler sends the R2 key raw in the path (`/objects/${objectName}`), so no
  `encodeURIComponent`. That would turn `/` into `%2F`.
- Downstream tickets #32 #33 #34 #52 #53 got their exclusion lines.
- Next: review, PR, then the user creates `CLOUDFLARE_TOKEN` and the Function deploys, then the live test.

## 2026-09-24

- Blockers clear. Boards draw no sold state. Owner chose the trimmed sold page and the X-ray
  cleanup inside the `publish` Function.
- Cloudflare account id `7966a3f105555a5b47fec8bf7d0d4bfb` (`wrangler whoami`). R2 delete goes
  through `DELETE /accounts/<acct>/r2/buckets/<bucket>/objects/<key>`, the endpoint wrangler uses.
- Detail page, index, structured data, sitemap and X-ray upload do not exist yet; their tickets
  get an exclusion line each.
- Next: canvas boards, then code.

## What was built — 2026-09-24

- Canvas: `HorseDetailSold` and `MobileDetailSold`. The hero stays and the sold label (by
  sex) takes the price's place. The dark band says "<Name> ma nowy dom." and carries
  "Konie na sprzedaż (N)". Then come the other-horses row and the footer. Nothing else.
- `HorseDetailStub.astro`: a sold horse gets the sold label in the sub-bar and the dark band
  linking `path(locale, 'horses')` with `site.horsesAvailable`. No price, no X-rays.
- `functions/index.js` `publish` calls `deleteSoldXrays` first. It R2-DELETEs each sold file
  (404 counts as ok), purges the URLs in batches of 30, and only then nulls `horses/<slug>/xrays/files`.
  The secret is `CLOUDFLARE_TOKEN`.
- `functions/sold.js` `soldXrays` + `tests/sold.test.mjs`.
- Admin editor: `confirm(admin.soldConfirm)` before saving a sold horse that still has files.
- Fixture: `norton`, sold, one X-ray file.
- #32 #33 #34 #52 #53: each got its exclusion line.

## Outcome — 2026-09-24

Approach as planned. Review clear. `npm run ci` and `npm test` (30/30) green.

- Rejected: cleanup in `deploy.yml` (it runs every deploy, leaves stale keys, and puts the token in GitHub). Also
  rejected: the full page with only the price swapped (it leaves someone else's horse's health data public).
- Trap: wrangler's R2 delete sends the key raw in the path; `encodeURIComponent` would
  turn `/` into `%2F` and delete nothing.
- Trap: the canvas publish can be refused as stale even when `canvas.json` is unchanged. Re-read it,
  compare the sha, then publish again.
- Trap: a horse flipped back from sold has lost its X-ray files; they must be re-uploaded.
- Verified live 2026-09-25: the Function was deployed with `CLOUDFLARE_TOKEN`. A throwaway PDF was `HIT` at the edge;
  after Publish it answered `404`, the object was gone, `xrays/files` was removed and the deploy succeeded. After
  a purge the edge caches the `404` itself, so a `HIT` on a `404` is expected. #63 changes the zone id and the
  base in `functions/index.js`.
