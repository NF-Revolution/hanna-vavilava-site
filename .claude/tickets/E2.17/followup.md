# E2.17 — followup

Shipped 2026-10-12 — see the last `## Outcome` at the bottom.

Issue [#188](https://github.com/NF-Revolution/hanna-vavilava-site/issues/188) ·
branch `188-e217-starts-sync-find-livejumpings-renamed-main-bundle`

## 2026-10-12

- Live `/ap/` checked: `<script src="main.7876af2d05848c54ce41.js" defer>`. Only the name changed.
- `bundleName(html)` added to `functions/starts.js`, test in `tests/starts.test.mjs`.
- `npm test` 72/72, `npm run ci` green, live `apiKey()` returns the key. Reviewer: clear.

## What was built — 2026-10-12

- `functions/starts.js` exports `bundleName(html)`, which matches `/src="(main[\w.-]*\.js)"/`, and
  `apiKey()` calls it. Anchoring on `src="main` skips `runtime.*` and `polyfills.*`.
- `tests/starts.test.mjs` covers the current tags, the old `main-es2015.<hash>.js` tags, and HTML
  with no main tag (`undefined`, so `apiKey()` still throws).

## Outcome — 2026-10-12

- Approach: read the bundle from its script tag, not from a fixed naming pattern.
- Rejected: adding a `main.` pattern beside the old one. It fixes this rename and no later one.
- Trap: a throw in `apiKey()` also stops the Monday `startsWeekly` run. It fails silently, with
  only a function log line. Counts froze for weeks before anyone noticed. Alerting is not built.
- Deploy is by hand: `refreshStarts` and `startsWeekly` only.
