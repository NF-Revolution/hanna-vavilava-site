# E4.12 — followup

Shipped 2026-10-03 — see the last `## Outcome` at the bottom.

## 2026-10-03

- First build, rejected: the whole landscape cover, uncropped, letterboxed on `--ground-dark` at 390, with the text under it. Owner: "the new mobile design sucks". Never pushed. Canvas v54 drew it and v56 restored the boards. #150's lightbox, which had landed on `MobileDetail` in between, was kept.
- Second build, approved approach: an optional portrait **phone cover** per horse, served to ≤720px through `<picture>` art direction. `MobileDetail` already draws a portrait frame (_kadr pionowy_), so the canvas needs no change. Ticket body rewritten to match.
- Checked with real Storage photos in a temporary fixture (reverted): covers `red-bull/8b1f2baa`, `lotus-blue/6d01a565`; portraits `red-bull/c7856957`, `lotus-blue/6c548328`, both 853 × 1280. The phone gets the portrait full-bleed and desktop is unchanged. Those portraits are head shots, so "head and four legs" waits for Hanna's full-body portraits.

next: none. Shipped.

## What was built — 2026-10-03

Issue #149.

1. `src/horse.ts`: `phoneCover: key.nullable().default(null)`. Its alt text is the cover's. `src/horse-form.ts` turns an empty field into `null`. `tests/horse.test.mjs` round-trips a phone cover and the empty case.
2. `src/components/Photo.astro`: new `phone` prop. Astro's `<Picture>` has no art direction, so with a phone key the `<picture>` is written by hand from `getImage`: phone sources with `media="(max-width: 720px)"` (AVIF, WebP and JPEG for the hero), then the cover's sources, then the `<img>`. The browser fetches one image. Without a phone key it is the same `<Picture>` as before.
3. `src/components/HorseDetail.astro`: the hero passes `phone={horse.phoneCover}`. On an unsold horse, `hero-barred` pads the hero text clear of the sticky `MobileBar` (81px). Before this the bar covered the meta line and price at 390. That was already true on main.
4. `src/pages/admin.astro`: a "Okładka na telefon" field under the photos, with an upload, a 9:16 preview and a remove button. It shares `store()` (downscale, then hash key, then `uploadBytes`) and `slugFor()` with the photo upload. `src/pages/admin/poradnik.astro` has a new "Okładka na telefon" section on how to shoot it.
5. i18n: `admin.fields.phoneCover`, `admin.phoneCover{Hint,Drop,Remove}` in both `pl.json` and `en.json`.

## Outcome — 2026-10-03

**Approach:** An optional portrait phone cover per horse, served through `<picture media>`. A horse without one keeps today's centre crop.
**Bugs met:** On a horse for sale, the sticky bar covered the hero's meta line and price. Fixed here.
**Rejected:** The letterbox (whole cover on dark bands), built and turned down by the owner; it is the second rejected "whole photo on empty ground" layout, after #33. A focal point: no portrait crop of a 3:2 side shot holds both the head and the legs. A blurred fill, and shrinking the hero.
**Traps for next time:** Headless Chrome `--window-size` enforces a minimum layout width of about 500px, so screenshot 390 inside an `<iframe width=390>`. A comment inside an `@media` block of an `.astro` `<style>` makes prettier re-indent it on every run, so keep comments outside the media block. `npm run build` wipes `dist/`, including any test harness in it. `inferRemoteSize` returns extra keys that `getImage` rejects, so pass `width` and `height`, not `...size`. The a11y check wants `width` and `height` on every `<img>`, admin included. The canvas can move on between your publishes, so diff a board before restoring it.
**Files that mattered:** `src/components/Photo.astro`, `src/components/HorseDetail.astro`, `src/pages/admin.astro`, `src/horse.ts`, `src/horse-form.ts`
