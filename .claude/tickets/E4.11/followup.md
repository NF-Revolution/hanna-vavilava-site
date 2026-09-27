# E4.11 — followup

Shipped 2026-09-27 — see the last `## Outcome` at the bottom.

## 2026-09-27

- plan approved: link inside Starts `<dd>` (X-ray link pattern), not new fact row — keeps 7/7 columns. EN-Horse has no facts, not reached.
- built: `livejumpingHref` in `src/site.ts`, third tuple slot on `factColumns` in `src/components/HorseDetail.astro`, `.xray-link` renamed `.fact-link`. Fixture has no `livejumpingName` — positive case checked by temp edit to `src/fixture.json` (cascada, `LOTUS BLUE B&C` → `LOTUS%20BLUE%20B%26C`), reverted.
- canvas v34: link under `Liczba startów` on `HorseDetail` (h 7057→7113) and `MobileDetail` (h 5885→5939), `canvas.json` sent. First publish refused as "not viewed latest" though same version — plain `read` of canvas url (no `paths`) before publish fixed it.

next: none — shipped.

## What was built — 2026-09-27

Issue #111. #108 decided the horse page links to the horse's livejumping search. Livejumping has no stable per-horse page, so the link is `https://livejumping.com/ap/search/horse/<encodeURIComponent(livejumpingName)>`. An empty name gives no link.

1. `src/site.ts`: `livejumpingHref(name)` next to `whatsappHref`. It is the only place in `src/` that holds the base URL.
2. `src/components/HorseDetail.astro`: `factColumns` is typed `[string, string, string?][][]`. The Starts row's third slot is the href. The `<dd>` renders `<a class="lbl fact-link" target="_blank" rel="noopener">` with the link text, a visually hidden new-tab suffix and an aria-hidden `&#8599;`. `.xray-link` is renamed `.fact-link` and serves both links.
3. i18n: `detail.livejumping.{link,newTab}` in `pl.json` and `en.json`.
4. Canvas v34: the link sits under the `Liczba startów` value on `HorseDetail` (h 7113) and `MobileDetail` (h 5939). The size triple and `canvas.json` changed with it. `EN-Horse` has no fact table, so the link does not reach it.

Acceptance: all 7 boxes on #111 ticked. `npm run ci` is green. `ticket-reviewer` verdict: clear.

## Outcome — 2026-09-27

**Approach:** The link sits inside the Starts `<dd>` and reuses the X-ray link pattern. This adds no new fact row and keeps the drawn 7/7 column balance.
**Bugs met:** none
**Rejected:** A separate fact row: it breaks the column balance and needs a label that repeats the link text. Sharing the base with `functions/starts.js`: that is a separate package calling the API, not the search page.
**Traps for next time:** `src/fixture.json` has no `livejumpingName`, so CI never renders the link. Check the positive case with a temporary fixture edit. The canvas publish is refused until you do a plain `read` of the canvas URL. A `read` with `paths` is not enough.
**Files that mattered:** `src/components/HorseDetail.astro`, `src/site.ts`, `src/horse.ts`, `src/i18n/pl.json`
