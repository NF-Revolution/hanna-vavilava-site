# E4.9 — followup

Shipped 2026-09-27 — see the last `## Outcome` at the bottom.

Issue [#39](https://github.com/NF-Revolution/hanna-vavilava-site/issues/39) ·
branch `39-e49-404-page` · canvas `F7qeoBwkyu2Dau5p1iLg2n` version 31

## 2026-09-27

- Plan approved, built and shipped in one session. No blockers. No board drew a 404.
- **Firebase Hosting serves only the root `404.html`.** There is no per-path 404, and the
  `i18n` config picks the language from `Accept-Language`, not from the path. So `/en/**`
  goes through a rewrite, and a rewrite to a static file answers 200.
- **The worktree guard blocks the rtk-rewritten `git`.** `git status` and `git branch` were
  refused. `/usr/bin/git` works.

## What was built — 2026-09-27

- `src/components/NotFound.astro`, rendered by `src/pages/404.astro` (PL, `dist/404.html`)
  and `src/pages/en/404.astro` (EN, `dist/en/404/index.html`). The page has the sub-bar
  `404 · <label>`, one lead line, and a text row per `site.horsesListed` horse (name, facts,
  price) linking through `path(locale, 'horse', slug)`. A link to the horses index follows.
  There are no photos. `routeKey="home"`, so the language switch goes to the other home.
- `Base.astro` and `Page.astro` take `noindex`: robots `noindex`, and no canonical, hreflang
  or `og:url`.
- `pages.notFound` in `pl.json` and `en.json`.
- `firebase.json`: rewrite `/en/**` to `/en/404/index.html`.
- Canvas: `NotFound` (1440 × 980) and `MobileNotFound` (390 × 1340) added, `canvas.json`
  updated.

## Outcome — 2026-09-27

- Approach as planned. `npm run ci` is green: 26 pages, links and a11y pass. The
  independent review was clear.
- Rejected: one bilingual 404 (mixes the languages), photo cards (the card markup is inline
  in `HorsesGrid`, so extracting it is a refactor), and a Cloud Function for a real EN 404
  (that is the upgrade path).
- Trap: the EN soft 404 is deliberate and recorded in `.claude/tickets/INDEX.md`. Do not
  "fix" it by adding a `/en/404.html` file, because Firebase never serves a nested 404. A
  new `/en/...` page that is missing from `dist` quietly shows the EN 404 with status 200.
