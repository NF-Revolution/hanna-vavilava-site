# E2.5 · Admin media upload — #20

Shipped 2026-09-23.

## 2026-09-23

- Approach comment posted on #20. Branch `20-e25-admin-media-upload`.
- Next: storage.rules, firebase.ts, photo.ts, schema, horse-form, admin UI, strings, tests.
- Built: `storage.rules` + `firebase.json`, `src/photo.ts`, `photoUrl` + `storageBucket` in
  `src/firebase.ts`, photo `alt`, photo rows in `/admin`, strings, stale R2 comments fixed.
- `npm run ci` green, `npm test` 26/26 (storage emulator added). Headless Chrome smoke of
  `downscale`: a 4032×3024 JPEG with a GPS APP1 comes out 2400×1800, no `Exif` bytes.
- ticket-reviewer: clear.
- Production upload returned 403: `storage.rules` had never been deployed. The owner then
  swapped the Warsaw bucket for `hanna-vavilava-site` in US-EAST1, which is inside the Always Free
  tier. Config, deploy target and `.firebaserc` changed, and the rules were deployed. An anonymous
  GET of a missing photo now returns 404, not 403.

## What was built — 2026-09-23

## Context

#20: drag-and-drop photos from `/admin`, downscaled client-side to 2400 px; the canvas
re-encode strips EXIF (iPhone GPS = yard location). Alt text required per image. Photos
only — video is #26, X-ray PDFs are #70 (comment on #20). Blocker #18 closed.

Today `photos` is a JSON textarea (`src/horse-form.ts` JSON_PATHS, `admin.astro` Media
section). Schema: `photos: [{ key, caption: text }]`.

**Where photos live — conflict, resolved to Storage.** Ticket body says Storage; the #20
comment says X-rays go "to R2 rather than Storage". Older code comments assume R2
(`astro.config.mjs` image.domains note, `deploy.yml` cache note, `horse.ts` `key` note).
Storage wins: a photo is a build input Astro re-encodes onto Hosting, so R2's free egress
buys nothing; Storage takes a direct browser upload gated by the `admin` claim in rules,
where R2 needs a presigning Function (that is #70's work). Bucket exists:
`hanna-vavilava-site.firebasestorage.app`, europe-central2. Stale comments get fixed.

No artboard change: the admin panel has none (E2.3 decision). Board read on the public
photo treatment only settles caption-vs-alt (see Schema).

## Approach

1. **Storage rules** new `storage.rules`, wired in `firebase.json` (`"storage": {"rules": …}`):
   - `match /photos/{slug}/{file}`: `allow read;` (photos are public once published, and
     it lets E4's Astro `<Image>` fetch without credentials);
     `allow create, update: if request.auth.token.admin == true && contentType == 'image/jpeg' && size < 10 MB`.
   - No delete, nothing else in the bucket.
2. **Config** `src/firebase.ts`: add `storageBucket`, plus
   `photoUrl(key)` = `https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded key>?alt=media`
   (the admin thumbnail now, E4's image source later).
3. **Downscale** new `src/photo.ts`, no firebase import (Node-testable):
   - `fit(w, h, max = 2400)` → scaled size, never upscales.
   - `downscale(file)`: `createImageBitmap(file, { imageOrientation: 'from-image' })` →
     `OffscreenCanvas` → `convertToBlob({ type: 'image/jpeg', quality: 0.85 })`. The re-encode
     writes no metadata, which is the EXIF/GPS strip.
   - `photoKey(slug, blob)` → `photos/<slug>/<sha8>.jpg` via `crypto.subtle` — content-addressed,
     so `cacheControl` from `src/media.ts` (immutable) is safe.
4. **Schema** `src/horse.ts`: photo = `{ key, alt, caption }`. Boards: hero (first photo)
   and grid cards show image only; the "Galeria" photos carry short visible captions
   ("01 · skok, profil"). So `caption: text` stays (empty allowed) and `alt` is added, required
   non-empty in both locales (`z.string().trim().min(1)`). Every stored horse has `photos: []`,
   no migration. Fix `key` comment.
5. **Form mapping** `src/horse-form.ts`: drop `photos` from JSON_PATHS. `toFields` already
   flattens the array to `photos.0.key`, `photos.0.alt.pl`…; `fromFields` gains one line
   `horse.photos = Object.values(horse.photos ?? {})`. The panel renumbers row inputs by DOM
   position after every add/remove/move, so indexes are always 0..n-1 in display order.
   Zod issue paths (`photos.1.alt.pl`) then match input names, so the existing error focus works.
6. **Panel** `src/pages/admin.astro`, Media section:
   - Drop zone `<label>` wrapping `<input type=file accept="image/*" multiple>`, `dragover`/`drop`
     handlers; hint "2400 px, EXIF/GPS removed". `role=status` line for progress and errors.
   - `<ol id="photos">` of rows from a `<template>`: thumbnail `<img alt="">`, hidden input
     `photos.N.key`, PL/EN alt inputs `required`, PL/EN caption inputs, up/down and Remove
     buttons with `aria-label`. First photo = cover (hero + grid card per boards) — hint says so,
     so up/down is how Hanna picks it.
   - `open()` clears and rebuilds rows from the stored horse before the field fill.
   - Upload needs a valid slug first (key contains it); files go one by one: downscale →
     key → `uploadBytes(…, { contentType: 'image/jpeg', cacheControl: media.cacheControl })` → row.
     Decode failure (HEIC in Chrome) → "cannot read <name>" in the status line.
   - Adds `firebase/storage` to the admin chunk only.
7. **Strings** in both `pl.json` / `en.json`: drop hint, uploading, failed, need-slug, alt label, remove.
8. **Stale comments**: `astro.config.mjs` (add `firebasestorage.googleapis.com` to
   `image.domains`, photos = Storage), `deploy.yml` cache note.

## Skipped (ponytail)

- Drag-to-reorder photos: up/down buttons cover it, accessible for free.
- Deleting Storage objects on remove/cancel: the saved horse may still reference them; orphans
  stay, `ponytail:` notes #23 cleanup as the upgrade.
- Guard against a file dropped outside the zone navigating away.

## Check

- `tests/horse.test.mjs`: photos round-trip through toFields/fromFields; empty alt fails; `fit()` 4032×3024 → 2400×1800, 800×600 unchanged.
- `tests/rules.test.mjs` + `npm test` emulators `--only database,storage`: anon upload denied,
  non-admin denied, admin jpeg ok, admin png denied, anon read ok, admin delete denied.

## Process

Approach comment on #20 → `gh issue develop 20 --base main --checkout` → copy plan to
`.claude/tickets/E2.5/` → build → `npm run ci` + `npm test` → `ticket-reviewer` → `create-pr`
(notes finalized, INDEX.md state row + decision line) → outcome comment.
Production `npx firebase-tools@15 deploy --only storage --project hanna-vavilava-site` only on
the user's go-ahead — until then uploads are denied by the bucket's default rules.

## Verification

- `npm run ci` green; `npm test` green (needs Java).
- `grep -rl firebase dist --include='*.html'` → only `dist/admin/index.html`.
- Emulator or prod (with go-ahead): drop an iPhone JPEG with GPS, download the object,
  `exiftool` shows no GPS/EXIF, long edge 2400; empty alt blocks save; saved horse parses.

## Outcome — 2026-09-23

- Shipped as planned. The approach is on #20.
- Rejected: R2 with a presigning Function (#70's pipeline, not needed for a build input),
  reusing `caption` as alt (the boards show visible gallery captions), deleting Storage
  objects on remove.
- Traps for next time:
  - `storage.rules` is deployed by hand, like the database rules:
    `npx firebase-tools@15 deploy --only storage --project hanna-vavilava-site`. A new bucket's
    default rules deny every upload and every thumbnail (the first production try hit 403).
  - The bucket is not the project default, so the deploy goes through the `photos` target in
    `.firebaserc`. A plain `"storage": { "rules": … }` fails with "Storage has not been set up".
  - `request.auth.token.admin` errors on a token without the claim; `token.get('admin', false)`
    denies quietly. Both deny, only one fills the emulator log.
  - Row inputs are renamed `photos.<i>.…` after every add, move and remove. `fromFields` relies
    on the numbering, and zod's issue path finds the input by that name.
  - Chrome and Firefox cannot decode HEIC; the panel names the file that failed. Safari can.
  - `--dump-dom` with `--virtual-time-budget` does not wait for `createImageBitmap`; a smoke
    test of `photo.ts` reads the page over the DevTools protocol instead.
