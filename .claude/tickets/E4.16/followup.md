# E4.16 — followup

Shipped 2026-10-06 — see the last `## Outcome` at the bottom.

## 2026-10-06

- Blockers: #164 is closed.
- The owner chose click-to-load over a plain lazy iframe, because Google's cookies need consent (the ePrivacy reasoning from the GA4 decision in INDEX.md). The ticket body is rewritten and the approach comment is posted.
- Plan 01 is approved.
- The code is built:
  - `AboutPage.astro` has a map section with a `srcdoc` placeholder.
  - `pages.about.map` is in both dictionaries.
  - The privacy notice changed in four places.
- `npm run ci` is green. Headless Chrome over CDP, at 1440 and at 390 with JS off: no Google request before the click, and the map renders after it.
- Canvas v63:
  - `About` grows to 2672 and `MobileAbout` to 3265; both draw the placeholder state.
  - `Faq` and `NotFound` move down 599px so nothing overlaps.
- Canvas v64: `Privacy` and `MobilePrivacy` carry the notice word for word, so they take the same copy changes and grow to 4440 and 7000.
- The `ticket-reviewer` agent's verdict: clear.

## What was built — 2026-10-06

Issue #165. Plan: a click-to-load map of the stables on the about page, Google named in the privacy notice, and the boards changed in the same PR.

1. **`src/components/AboutPage.astro`**: a `.map` section between the steps and the dark band.
   - The left column holds the head, an `<address>` built from `stables`, and the `stables.mapsHref` link. The link has a 44px tap height.
   - The right column holds the `<iframe>`:
     - `title`, `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`
     - `aspect-ratio` 16/9, or 4/3 at ≤720px
     - `srcdoc` = a self-contained placeholder: Archivo from `/fonts`, the tokens' hex values, and one link to `mapSrc`.
   - `mapSrc` is `https://www.google.com/maps?q={lat},{lng}&z=14&hl={locale}&output=embed`. It carries a `ponytail:` note on the keyless URL.
2. **`pl.json` / `en.json`**:
   - `pages.about.map` holds `{ head, title, load, note, open }`.
   - The privacy notice changes in four places:
     - `data.p[5]`: the map. Nothing goes out before the click; after it, the IP, browser data and cookies. The basis is art. 6(1)(a) plus art. 399 PKE, and consent is withdrawn by deleting Google's cookies. Google is a separate controller.
     - `transfers.p[1]`: Google LLC under the DPF.
     - `device.p[0]`: "no consent banner" replaces "asks for no consent". A new `device.p[3]` says the map's cookies are the only ones that need consent, and the click is that consent.
     - `other.p[2]`: one more sentence, for the Google Maps link.
3. **Canvas**: `About`, `MobileAbout`, `Privacy`, `MobilePrivacy` and the index (heights, plus `Faq`/`NotFound` y +599).

## Outcome — 2026-10-06

**Approach:** The iframe starts as a `srcdoc` page of our own. Its one link navigates the frame to Google's keyless embed URL. There is no JS and no banner, and Google sees nothing until the press. The coordinates set the pin, and the address sits beside it.

**Rejected:**

- A plain lazy iframe, as the body first said. Cookies would land without consent, contradicting the GA4 reasoning.
- The Maps Embed API. It needs a key and a billing account. It stays the upgrade path.
- A JS facade. It adds inline JS for what `srcdoc` does natively.
- `q=` with the name or address. The geocoder can drift.

**Traps for next time:**

- `maps?…&output=embed` answers 301 with `X-Frame-Options: SAMEORIGIN`. Browsers judge XFO only on the final response, so it frames. It is undocumented.
- The `&` in `mapSrc` must be `&amp;` inside the srcdoc HTML. Astro escapes the attribute once more, which is correct.
- The `srcdoc` document has no access to the page's CSS variables or fonts. It carries its own `@font-face` and hex values, so a token change must also change it.
- The Privacy boards carry the notice verbatim. Any privacy copy change edits `Privacy.dc.html` and `MobilePrivacy.dc.html` too.
- `Emulation.setScriptExecutionDisabled` in CDP did not stop Google's own JS inside the frame. The JS-off claim covers our page, and Google's map needs its own JS.

**Files that mattered:** `src/components/AboutPage.astro`, `src/i18n/{pl,en}.json`, canvas `About`, `MobileAbout`, `Privacy`, `MobilePrivacy`.
