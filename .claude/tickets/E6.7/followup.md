# E6.7 · Campaign tagging convention (#56) — followup

Shipped 2026-10-03 — see the last `## Outcome` at the bottom.

## 2026-10-03

- Plan approved. Beacon (E6.6) already sends `pathname + search`, so Umami gets `utm_*` from
  the landing pageview. No code; convention goes in `README.md`.
- Approach posted on #56. README section and INDEX decision written. `npm run ci` green,
  independent review clear.

next: none — shipped.

## What was built — 2026-10-03

Problem: links posted outside the site (Instagram bio, ads) need a fixed tagging scheme so
enquiries can be traced to their source.

- `README.md` `## Campaign links`:
  - rules: lowercase, hyphens, no spaces; `utm_source` / `utm_medium` / `utm_campaign` always
    set, `utm_content` optional
  - a vocabulary table for each tag
  - landing pages `/`, `/en` or a horse page, never with a trailing slash
    (`trailingSlash: false` redirects)
  - ready links for the Instagram bio and a Meta horse ad on `hanna-vavilava-site.web.app`
  - change the host when the site moves to `hannavavilava.com` (E8.1)
  - Umami: the UTM report shows visits; the Attribution report uses `enquiry_success`,
    `whatsapp_click` or `telegram_click` as the conversion.
- `.claude/tickets/INDEX.md`: E6.7 row, plus the decision "attribution happens in Umami, not
  in the enquiry".
- No code: the `Base.astro` beacon already sends `location.pathname + location.search`.

Acceptance: documented convention for the bio link and ad links — met.

## Outcome — 2026-10-03

**Approach:** documentation only. The E6.6 beacon already sends the query string, so Umami's
UTM and Attribution reports (Attribution since Umami v2.18) do the attribution.
**Bugs met:** none.
**Rejected:**

- Putting the source into the enquiry message. It needs JS to carry the tags to the form, on
  pages already over the 1 KB budget, and it misses WhatsApp and Telegram clicks.
- A link builder in the admin panel: not worth it for one bio link and a few ads.
- Meta's `{{site_source_name}}`: it gives `ig` / `fb`, which break the vocabulary.

**Traps for next time:**

- When E8.1 moves the domain, the bio link and every live ad still point at `.web.app`, so
  edit them by hand.
- Never link to `/en/`: the redirect may drop the tags.
- The tags are not checked against live Umami yet. Open the bio link once on the live host and
  check that the UTM report shows `instagram / bio / profile`.

**Files that mattered:** `README.md`, `src/layouts/Base.astro` (beacon `url`),
`firebase.json` (`trailingSlash`).
