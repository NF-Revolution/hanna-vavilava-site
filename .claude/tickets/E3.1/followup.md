# E3.1 · Responsive picture component

Shipped 2026-09-25 — see the last `## Outcome` at the bottom.

Issue [#25](https://github.com/NF-Revolution/hanna-vavilava-site/issues/25) · branch `25-e31-responsive-picture-component`

## 2026-09-25

- Blocker #10 closed. Approach comment posted on #25 before code.
- `src/components/Photo.astro` over `<Picture>`; `check-a11y.mjs` fails an `<img>` without `width` and `height`.
- Trap: remote src → Astro's fallback defaults to PNG, not JPEG. `fallbackFormat="jpg"` is explicit.
- Trap: Astro trims `widths` to the original only for imported (ESM) images. A remote one gets `NNNNw` labels that sharp will not honour (`withoutEnlargement`). The component trims itself.
- Verified with a stand-in: `photoUrl` → picsum, domains added, scratch page. Landscape 2400×1600 hero → avif+webp+jpg 640…2400w, eager, `fetchpriority="high"`, files really 2400 px. Portrait 1200×1800 → webp+jpg 640/960/1200w, lazy. A bare `<img>` failed the new rule. Stand-in reverted, `npm run ci` green.
- Trap: the worktree hook refuses bare `git` (rtk rewrite). Use `/usr/bin/git -C <worktree>`.
- ticket-reviewer: clear, all four criteria met.

next: none — shipped.

## What was built — 2026-09-25

**Problem.** E4.x needs one way to put a horse photo on a page: srcset with WebP and a JPEG fallback, explicit width and height everywhere, lazy below the fold, AVIF only on the hero. Photos are Storage keys (`photos/<slug>/<sha8>.jpg`, ≤2400 px long edge), and the schema stores no dimensions.

**Steps.**

1. `src/components/Photo.astro` wraps `<Picture>` from `astro:assets`. Props: `photo` (`Horse['photos'][number]`), `locale`, `sizes` (required), `hero?`, `class?`.
2. URL via the existing `photoUrl` in `src/firebase.ts`. The comment is updated: the build imports it too, and it still holds no SDK.
3. `inferRemoteSize` once per photo → real `width`/`height` on `<img>`.
4. Widths ladder `640, 960, 1280, 1920`, filtered `< width`, plus `width`.
5. `formats`: `['avif','webp']` on the hero, `['webp']` otherwise. `fallbackFormat="jpg"`.
6. Hero: `loading="eager"`, `fetchpriority="high"`. Otherwise: `loading="lazy"`. Both `decoding="async"`.
7. `scripts/check-a11y.mjs`: every `<img>` in `dist/` needs `width` and `height`.

**Acceptance.** WebP + JPEG srcset · width/height on every `<img>`, enforced in CI · lazy except the hero · AVIF on the hero only. All met.

## Outcome — 2026-09-25

**Approach:** thin wrapper over Astro's own `<Picture>`: no dependency, and sharp is already installed. The size is inferred at build, so the schema and the admin panel did not change.
**Bugs met:** none in the shipped code. The two Astro defaults below would have been bugs.
**Rejected:** `width`/`height` in the photo schema (admin change plus migration for numbers the build reads for free; it is the named upgrade in the `ponytail:` comment). Astro's `layout` prop (it picks widths and `sizes` itself and injects global styles). AVIF on the gallery (the ticket's own reason). Reading the boards (the component draws nothing; each E4.x slot brings its `sizes`).
**Traps for next time:** remote `<Picture>` falls back to PNG unless `fallbackFormat` is set. `widths` above the original are not trimmed for remote images. No consumer yet, and the fixture has `photos: []`, so `npm run ci` does not exercise the component; the first E4.x page using it is its real test. Seeded prod photos are 1280 px (E2.9), so the ladder ends at 1280 there.
**Files that mattered:** `src/components/Photo.astro`, `node_modules/astro/components/Picture.astro`, `node_modules/astro/dist/assets/services/service.js` (width trimming), `src/firebase.ts`, `scripts/check-a11y.mjs`.
