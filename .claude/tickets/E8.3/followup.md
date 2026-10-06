# E8.3 — followup

Shipped 2026-10-06 — see the last `## Outcome` at the bottom.

Issue [#65](https://github.com/NF-Revolution/hanna-vavilava-site/issues/65) ·
branch `65-e83-performance-budget-in-ci`

## What was built — 2026-10-06

- `scripts/check-budget.mjs` uses regexes over `dist/`, the same shape as `check-a11y.mjs`, and
  adds no dependency. It runs as `npm run budget`: at the end of `npm run ci`, and after
  `npm run links` in `preview.yml` and `deploy.yml`, before either one deploys.
- **JS, 4 KB per public page.** It counts inline `<script>` bodies plus the size of any
  `/_astro/*.js` the page references. `ld+json` is skipped. Turnstile's `api.js` is appended
  at runtime, so it is never in the HTML. A page with no beacon (any build that is not
  live) gets a 1 KB reserve for it. `dist/admin/**` is skipped.
- **Images, 1 MB per page.** Each non-lazy `<img>` counts at its largest `src`/`srcset`
  candidate found in `dist/`. Lazy images are not counted.
- **Poster LCP proxy.** This applies to `index.html` and `en/index.html` only. The
  `<img fetchpriority="high">` must exist and must not be lazy, and its smallest
  candidate must be at most 120 KB.
- Also updated: the #65 body (acceptance criteria with the numbers), the `AGENTS.md`
  `ci` line, and a decision entry and State row in `.claude/tickets/INDEX.md`.

## Outcome — 2026-10-06

The approach was chosen with the owner. LCP is checked by a static proxy rather than by
Lighthouse CI, and the image cap is 1 MB. The fixture build has this headroom: the most JS
is 2.8 KB, on cascada (beacon reserve included); the most images is 597.5 KB, on the
homepage; and the poster's 640w jpg is 66 KB. Four negative cases were run against `dist/`
and each failed as expected: no `fetchpriority`, a lazy poster, JS padded to 6.7 KB, and
eight full posters on one page.

Traps for next time:

- The beacon only renders when `HOSTING_CHANNEL=live`. The fixture count is a guess built
  from `BEACON_RESERVE`. Only the deploy build measures the real thing, so a deploy can
  fail on the budget even when `npm run ci` passed.
- An `<img>` whose URL is not in `dist/` counts as 0 bytes. Today every image goes through
  `astro:assets`. A raw remote `<img src="https://…">` would get past the image cap.
