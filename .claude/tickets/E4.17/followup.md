# E4.17 — followup

Shipped 2026-10-06 — see the last `## Outcome` at the bottom.

## 2026-10-06

- Plan 01 was approved. Blocker #164 is closed. The approach comment is on #166.
- Canvas v61 changed four boards. `Footer` and `FooterMobile` gained the link and kept their size, because their fixed roots have slack. `Confirmation` grew from 1040 to 1100 and `MobileConfirmation` from 1780 to 1840. To make room, `EN-Horse` moved down to y 2550 and `EN-Enquiry` to y 3370, so `canvas.json` was sent.
- `npm run ci` is green. 34 of the 41 built pages carry the link. The ones without it are home, menu and admin, which have no footer.
- `ticket-reviewer`: clear.

## What was built — 2026-10-06

Issue #166. Plan: one `directionsHref` constant, linked from two places.

1. `src/site.ts`: `directionsHref` sits beside `phoneHref`. It is `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`, built from `stables`.
2. `pl.json` / `en.json`: `footer.directions` and `pages.enquirySent.directions` read `Dojazd` / `Directions`.
3. `Footer.astro`: the link goes inside the location `<p>`, after a `<br />`, as `.foot-directions`. It is inline-flex, at least 44px tall, in ink colour, with an `→`.
4. `EnquiryDone.astro`: the meeting step (`i === 1`) gets the page's own `.more` link, with `align-self: flex-start`.

## Outcome — 2026-10-06

**Approach:** It is a plain link opened in the same tab, as the WhatsApp and phone links are. No third party loads, so the privacy notice is unchanged.
**Rejected:**

- A link inside the location sentence. Its tap target is about 17px, and the footer keeps 44px.
- An embedded map. That belongs to #165, and it loads a third party.
- `directionsHref()` as a function. It has no parameter.

**Traps for next time:**

- Use the coordinates, never the address. The address geocodes to the village, and the gate is on ul. Długa.
- The sent-page link is keyed on step index 1. If the steps are reordered, move the link with them. The upgrade is a `link` field on the step.
- The `Confirmation` board has only 50px below it before `EN-Horse`. Growing it means moving the boards below.
- In this worktree the guard refuses headless Chrome, because its path holds spaces. Nothing was checked by screenshot.

**Files that mattered:** `src/site.ts`, `src/i18n/{pl,en}.json`, `src/components/{Footer,EnquiryDone}.astro`
