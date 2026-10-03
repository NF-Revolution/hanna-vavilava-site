# E7.4 · Technology statement — followup

Shipped 2026-10-03 — see the last `## Outcome` at the bottom.

## 2026-10-03

- Plan approved. Section in privacy notice (`#cookies`), not own page. Turnstile: Cloudflare cookie policy says it may set `__cf_bm`/`cf_clearance`/`cf_chl_*` — statement says so, "nothing" only for our origin.
- PR #144 (E7.5) open on same files; rebase if it lands first.
- Built: `pages.privacy.device` + `footer.cookies` in both dictionaries, `#cookies` section, footer-bar links. `npm run ci` green. Homepage has no footer by design, so no link there.
- Reviewer (high): copy said video downloads only on play, but homepage hero loop autoplays from R2 (`HomeScreen.astro` script) unless reduced motion / Save-Data / slow connection. Copy now splits horse-page films (on play) from homepage loop (straight away).
  next: none — shipped.

## What was built — 2026-10-03

Problem: #60 asks for a short statement of what the site stores on the device (nothing) and what
the video does once played, linked from the footer. No board drew it; the privacy page (E7.3) was
linked from nowhere.

Steps:

1. `pages.privacy.device` `{ h, p[3] }` in `pl.json` + `en.json`: no cookies or device storage,
   hence no banner (browser cache aside); videos are plain files on `{media}` (Cloudflare R2, no
   cookie) — horse-page films load on play, homepage loop loads straight away unless reduced
   motion / Save-Data / slow connection; play counted as cookieless event; Turnstile loads once a
   form is started and Cloudflare may set strictly necessary security cookies.
2. `src/components/PrivacyPage.astro`: `page.device` appended to `rest`, its section
   `id="cookies"`, `fill(p, { media: host })` in the rest loop.
3. `src/components/Footer.astro`: `.foot-legal` in `.foot-bar` before the language switch —
   `nav.privacy` → `path(locale,'privacy')`, `footer.cookies` → `…#cookies`. 44px rows.
4. Canvas v51: `Footer` + `FooterMobile` links; `Privacy` (h 3800) + `MobilePrivacy` (h 5750)
   section.

Acceptance: device storage stated; video behaviour stated; short; linked from the footer on every
page that has one; `npm run ci` green.

## Outcome — 2026-10-03

**Approach:** a last `#cookies` section in the privacy notice plus two footer-bar links. Three paragraphs sit beside the processors list they refer to, with no new route.
**Bugs met:** the copy said "only the still frame until you press play", but the homepage hero loop autoplays from R2 (`src/components/HomeScreen.astro:182`). Reworded to cover both videos.
**Rejected:** a separate `/technologia` page. It needed a new route, two wrappers, a sitemap entry and two boards for three paragraphs.
**Traps for next time:** "stores nothing" is true of our origin only. Turnstile may set Cloudflare cookies. Any new video, script or embed must update `pages.privacy.device`. A canvas publish can be refused when another session writes `canvas.json` at the same time: re-read it, re-apply the height and publish again.
**Files that mattered:** `src/i18n/pl.json` (`pages.privacy.device`), `src/components/PrivacyPage.astro`, `src/components/Footer.astro`, `src/components/HomeScreen.astro`, `src/components/Video.astro`.
