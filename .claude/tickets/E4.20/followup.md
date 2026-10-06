# E4.20 — followup

Shipped 2026-10-06 — see the last `## Outcome` at the bottom.

Issue #179.

## 2026-10-06

- Plan approved with a read-time upgrade shim (`storedHorse = z.preprocess(upgrade, horseSchema)`)
  plus committed migration script, because preview and deploy builds read the live DB.
- Owner mid-build: not live yet, no migrations, let old versions fail. Shim + script dropped;
  live `/horses` rewritten once by a throwaway script outside the repo.
- Review blocker: `tests/horse.test.mjs` still on the old shape (`npm test` runs in the CI
  workflow, not in `npm run ci`). Fixed, plus a test that a pre-E4.20 horse and an untitled
  video fail the parse.
  next: none — shipped.

## What was built — 2026-10-06

**Problem.** Buyer should see the horse move before reading. Videos and gallery under the hero,
videos a carousel of any number of clips, four fact rows folded into one free description,
`notFor` / `health.dewormedOn` / `viewing` / `facts.location` removed, Location = the stables.

**Steps.**

1. `src/horse.ts`: top-level `description: text`; `facts` keeps breeding, trainingLevel,
   lastStart, starts, documents; `notFor`, `viewing`, `health.dewormedOn` gone; `videos[]`
   loses `kind`, gains `title` {pl,en} `.trim().min(1)` (same rule as photo `alt`).
2. `src/fixture.json`: both horses to the new shape, `description` PLACEHOLDER.
3. `src/components/HorseDetail.astro`: order unsold = hero → SubBar → Videos (`ul.reel`,
   flex + `overflow-x:auto` + `scroll-snap-type:x mandatory`, `li` 85%, `:only-child` 100%,
   `tabindex=0` only with >1 clip, `aria-labelledby` the h2) → Gallery → Description (blank
   line = `<p>`, `white-space: pre-line`, 68ch) → Facts 5 | 5 (left pedigree, breeding,
   trainingLevel, level, price; right lastStart, starts, location, documents, sale) → Suits
   → Health. Fact link slot is `{href, text, newTab?}`: livejumping new tab ↗, Location =
   `stables` name + street + postal code + town with `directionsHref`, same tab →, text
   `footer.directions`. Viewing section and `.cols-3` deleted.
4. `src/components/Video.astro`: `video.title[locale]` for the heading (now `h3`, the
   section owns the h2), `aria-label` and VideoObject `name`; `data-video={video.title.pl}`
   for analytics; `data-kind` and the round max-height rule gone.
5. Admin: `description` pair in Basics after headline, 8-row textareas; `notFor`,
   `health.dewormedOn`, Viewing section removed; `LINES = ['suits']`.
6. `scripts/video.mjs` + README: `npm run video -- <file> clip <slug>`, emits an empty
   `title` the editor's parse forces filled.
7. i18n both files: + `detail.videos`, `detail.description`, `admin.fields.description`;
   − `video.sales/round`, `detail.notFor/viewing`, the eight dead `rows.*`, the removed admin
   fields and `sections.viewing`.
8. Live `/horses` (cascada, lotus-blue, red-bull) rewritten in place: legacy keys stripped,
   `description` = the four old texts deduped, joined `\n\n`; video `title` from `kind`
   ("Film sprzedażowy"/"Sales video", "Pełny przejazd, bez cięć"/"Full round, no cuts").
9. Canvas v68: `HorseDetail` (7259 → 6830) and `MobileDetail` (7044 → 6390) redrawn.

**Acceptance.** All twelve boxes on #179; `npm run ci` and `npm test` (71/71) green; a local
build against the rewritten live horses rendered lotus-blue's two clips in the strip.

## Outcome — 2026-10-06

**Approach:** CSS scroll-snap strip for the videos and a strict schema on the new shape. The live
DB was rewritten once, outside the repo, so there is no shim and no migration code to carry.
**Bugs met:** none in the shipped code. `tests/horse.test.mjs` fixture was on the old shape. It
was caught by review, because `npm run ci` does not run `npm test`.
**Rejected:** read-time upgrade shim + committed `migrate-horses.mjs`. That is right for a live site, but the owner
said not live yet, let old versions fail. A two-phase additive migration was impossible: the old
schema is strict at the top level and requires `viewing`. A slider library was ruled out by the ticket.
**Traps for next time:** preview and deploy builds read the live DB, so any schema change that
breaks a stored horse breaks every open PR's preview and Publish on main, until the DB matches.
`npm test` needs `npm ci --prefix functions` in a fresh worktree, or the emulator tests 404.
Nested `facts`/`health`/video objects are non-strict, so extra keys there are silently stripped and only
top-level keys fail the parse. Local `main` can be stale in a worktree; diff against `origin/main`.
**Files that mattered:** `src/horse.ts`, `src/components/HorseDetail.astro`,
`src/components/Video.astro`, `src/pages/admin.astro`, `tests/horse.test.mjs`.
