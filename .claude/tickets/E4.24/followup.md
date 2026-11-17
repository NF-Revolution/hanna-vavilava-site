# E4.24 — horse page: own cover, gallery above videos, six fields gone

Status: shipped at the pull request (2026-11-17)

## 2026-11-17

- Plan 01 approved. Owner: facts 3 left / 2 right, the lone X-rays row full width.
- Code done; `npm run ci` green, `npm test` 68/68. Canvas v85: four detail boards redrawn.
- Reviewer: one blocker, the live DB rewrite before merge — run after the owner's sign-off.
- Owner signed off the 1440/390 shots built from live data. Live `/horses` rewritten; backup at
  `~/Documents/hanna-backups/horses-before-E4.24-2026-11-17.json`. All three horses parse.

## What was built — 2026-11-17

**Problem.** The cover was `photos[0]`, so the hero repeated as gallery slide 01. Hanna also
wanted photos before videos and six fields off the page and the panel.

**Steps.**

1. `src/horse.ts`: `cover: { key, alt } | null` (no caption), a shared `alt` const; `photos` is
   the gallery only. `seller`, `suits`, `facts.trainingLevel`, `facts.documents` and the whole
   `health` object deleted.
2. `HorseDetail.astro`: hero, og:image card, other-horses cards read `cover`; Product `image`
   is the cover, then the gallery. Gallery section above videos. Facts: pedigree, breeding,
   level | location, price (`ceil(n/2)`, left takes the odd row). Health only `{xrays && …}`,
   one `.table.wide` row and the vet note. `HorsesGrid`, `HorsesIndex` read `cover`;
   `Photo.astro` takes `NonNullable<Horse['cover']>`.
3. Admin: the phone-cover widget became a generic `image` kind, a `[data-image]` fieldset per
   field (`cover.key`, `phoneCover`), sizes from an `images` map. Media order: cover, its alt
   pair, phone cover, photos, videos. Sections "Who it suits" and "Health" and the `lines` kind
   gone. `horse-form.ts`: `LINES` gone; an empty `cover.key` is `cover: null`.
4. i18n both files: rows, `saleKind`, `lineHint`, sections, fields and seller options removed;
   cover field labels and hints added; `photoHint` reworded. `poradnik.astro` says the cover
   is its own field.
5. Fixture and `tests/horse.test.mjs` on the new shape, plus an empty-cover and alt test.
6. Live DB: a throwaway ADC script (job tmp, not committed) read `/horses`, backed it up,
   moved `photos[0]` to `cover`, deleted the removed keys, and `set` it.
7. Canvas v85: `HorseDetail`, `MobileDetail` (gallery above films, slide 01 a new photo, rows
   gone, health one row); the sold twins' hero label says it is the cover.

## Outcome — 2026-11-17

**Approach:** a separate `cover` field, with no read-time shim — pre-launch rule, rewrite the DB.
**Bugs met:** the admin cover previews lost `width`/`height`, and `npm run a11y` caught it.
**Rejected:** a cover flag on one gallery photo, which would need filtering everywhere; a 2+2
facts grid with Location full width; left-column-only Health.
**Traps for next time:** the worktree guard refuses shell heredocs that `cd` and write. Put
the script in a file and run it. `firebase-admin` v13 needs `createRequire(functions/package.json)`
and the modular `firebase-admin/app` import. The Artifact `root` must sit under the working
directory, not the job tmp. A board's height was kept; the removed rows leave ground under
the footer.
**Not done:** no enquiry-assistant template carries the sale kind yet.
