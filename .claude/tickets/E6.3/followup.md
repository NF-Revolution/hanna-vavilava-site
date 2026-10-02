# E6.3 — followup

Shipped 2026-10-01.

Issue [#52](https://github.com/NF-Revolution/hanna-vavilava-site/issues/52) ·
branch `52-e63-structured-data`

## 2026-10-01

- Blocker #50 is closed. The approach is posted on #52. No board read: structured data is drawn on
  no board, as with E6.1.
- The body said to drop only the Offer for an on-request horse. A Product with no offers is itself
  invalid in Search Console, so the whole Product goes. The body was fixed before building.

## What was built — 2026-10-01

- `src/components/JsonLd.astro`: one `application/ld+json` block, with `<` escaped as `<`
  so database text cannot close the script.
- `src/components/HorseDetail.astro`: a BreadcrumbList (horses → horse) on every horse page.
  Product + Offer only when the horse is priced and not sold: gross EUR, `InStock` or `Reserved`,
  and the seller is `{"@id": "<pl home>#business"}`.
- `src/components/Video.astro`: a VideoObject per video. `contentUrl` and `thumbnailUrl` are on the
  media host, `duration` is ISO, and the transcript is the page locale's (left out when empty).
  `uploadDate` is the `Last-Modified` from one HEAD request. With no header, the node is skipped
  with a warning.
- `src/components/HomeScreen.astro`: a LocalBusiness on both home pages under one `@id`, with
  `sameAs` Instagram and Telegram. The address is `addressCountry: PL` only (PLACEHOLDER, E7.5).
- `src/components/FaqPage.astro`: a FAQPage from `pages.faq.items`.
- `scripts/check-links.mjs`: every block parses. It fails a Product without an Offer and an Offer
  without a numeric price and a currency.

## Outcome — 2026-10-01

- Fixture: `cascada` emits the breadcrumb and the Product with `"price":32000`. Sold `norton` emits
  the breadcrumb only. Removing the price from the built cascada page makes `npm run links` fail.
- Trap: the fixture has no videos, so CI never builds a VideoObject. To test it, give a fixture
  horse a video on `home/hero-ed398659.mp4` with poster `home/hero-497bbe4a.jpg`. That gave
  `uploadDate 2026-09-25T13:36:12Z`, and a `</script>` in the transcript came out escaped.
- Trap: Google gives FAQ rich results only to government and health sites since 2023. The block is
  cheap and still read, but it will not show as a rich result.
- Rejected: one `@graph` in `<head>`, an upload-date field in the schema and the editor, the build
  date as `uploadDate`, `priceValidUntil` and the shipping and returns fields, and `embedUrl`.
