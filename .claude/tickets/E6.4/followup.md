# E6.4 — followup

Shipped 2026-10-01.

Issue [#53](https://github.com/NF-Revolution/hanna-vavilava-site/issues/53) ·
branch `53-e64-sitemap-robots-and-search-console`

## 2026-10-01

- Blocker #50 is closed. The approach is posted on #53. The owner chose a site-wide `noindex` over
  `Disallow: /` for throwaway builds.
- `npm run ci` is green. `ticket-reviewer` returned `Verdict: clear`.

## What was built — 2026-10-01

- `site.indexable` in `src/site.ts` is true only when `HOSTING_CHANNEL=live` is set and the `SITE_URL` host
  is not `.web.app` or `.firebaseapp.com`. Only `deploy.yml` sets the channel, so the flag fails closed.
- `Base.astro` adds `<meta name="robots" content="noindex">` when the build is not indexable, and keeps
  canonical, hreflang and `og:url`. A page's own `noindex` still drops them, as before.
- `src/pages/robots.txt.ts` replaces `public/robots.txt`. It always has `Disallow: /admin`, and adds the
  `Sitemap:` line only when the build is indexable.
- `src/pages/sitemap.xml.ts` lists every route except `horse`, `menu`, `enquirySent` and `enquiryFailed`,
  plus `site.horsesListed`. Each locale gets its own `<url>` with pl, en and x-default alternates.
- `scripts/check-links.mjs` checks the sitemap. Its head pass now skips only pages with `noindex` and no canonical.
- #63's checklist now carries Search Console (a Domain property verified by DNS TXT) and the Bing import.

## Outcome — 2026-10-01

- Verified with three builds. Default: `noindex` everywhere and no `Sitemap:` line. `live` + the real
  domain: `Sitemap:` present, and `noindex` only on admin, 404 and the enquiry result pages. `live` +
  `.web.app`: still `noindex`. The fixture's sold horse `norton` has a page but no sitemap entry.
- Rejected: `Disallow: /`, because it hides the `noindex`; a `PREVIEW` flag, because it fails open; and
  `@astrojs/sitemap`, because its filter cannot see a horse's status.
- Trap: after #63, `.web.app` serves the same indexable build, because a static build cannot tell
  which host serves it. Only the canonical covers it. The fix is #63's last checklist item.
- Trap: the link check skips page-level `noindex` pages by "noindex and no canonical". A page that
  loses its canonical while also carrying `noindex` passes silently.
