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
- The `ticket-reviewer` agent's verdict: clear. PR #175 is open, rebased onto #173.
- **Reversed, same day.** The owner saw the placeholder on the preview and rejected it: "let's just show the map".
  - The `srcdoc` placeholder and the `map.load` / `map.note` keys are gone. The iframe takes `src={mapSrc}` and stays lazy.
  - Privacy:
    - `data.p[5]` is now legitimate interest (art. 6(1)(f)), loading as the visitor scrolls.
    - `device.p[0]` is back to "asks for no consent".
    - `device.p[3]` says Google may set cookies once the map loads.
  - Canvas v65: the about boards draw the frame as a labelled map placeholder (a board can't hold an iframe), and the privacy boards take the new copy.

## What was built — 2026-10-06

Issue #165. Plan: a map of the stables on the about page, Google named in the privacy notice, and the boards changed in the same PR.

1. **`src/components/AboutPage.astro`**: a `.map` section between the steps and the dark band.
   - The left column holds the head, an `<address>` built from `stables`, and the `stables.mapsHref` link. The link has a 44px tap height.
   - The right column holds the `<iframe>`:
     - `src={mapSrc}`, `title`, `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`
     - `aspect-ratio` 16/9, or 4/3 at ≤720px
   - `mapSrc` is `https://www.google.com/maps?q={lat},{lng}&z=14&hl={locale}&output=embed`. It carries a `ponytail:` note on the keyless URL.
2. **`pl.json` / `en.json`**:
   - `pages.about.map` holds `{ head, title, open }`.
   - The privacy notice changes in four places:
     - `data.p[5]`: the map loads as you scroll to it, and Google gets the IP, browser data and may set cookies. The basis is art. 6(1)(f), and Google is a separate controller.
     - `transfers.p[1]`: Google LLC under the DPF.
     - `device.p[3]`: Google's cookies from the map.
     - `other.p[2]`: one more sentence, for the Google Maps link.
3. **Canvas**: `About`, `MobileAbout`, `Privacy`, `MobilePrivacy` and the index (heights, plus `Faq`/`NotFound` y +599).

## Outcome — 2026-10-06

**Approach:** A plain lazy Google embed from the keyless URL. The coordinates set the pin, and the address and place link sit beside it. A fixed aspect ratio means no layout shift.

**Rejected:**

- A click-to-load `srcdoc` placeholder. It was built and shipped to the preview, and the owner rejected it on sight: a grey box with a button is worse for a buyer than the map. It is in the history of #175 if consent ever has to be gated.
- The Maps Embed API. It needs a key and a billing account. It stays the upgrade path.
- `q=` with the name or address. The geocoder can drift.

**Traps for next time:**

- The map sets Google cookies without consent. That sits against the GA4 reasoning in INDEX.md; the owner accepted it.
- `maps?…&output=embed` answers 301 with `X-Frame-Options: SAMEORIGIN`. Browsers judge XFO only on the final response, so it frames. It is undocumented.
- The Privacy boards carry the notice verbatim. Any privacy copy change edits `Privacy.dc.html` and `MobilePrivacy.dc.html` too.
- Google's map needs its own JS inside the frame. With JS off, the place link beside it is what works.

**Files that mattered:** `src/components/AboutPage.astro`, `src/i18n/{pl,en}.json`, canvas `About`, `MobileAbout`, `Privacy`, `MobilePrivacy`.
