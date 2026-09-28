# E5.6 — followup

Shipped 2026-09-28. See the last `## Outcome` at the bottom.

Issue [#45](https://github.com/NF-Revolution/hanna-vavilava-site/issues/45) ·
branch `45-e56-turnstile`

## 2026-09-28

- Plan 01 approved. The only blocker, #42, is closed. The approach comment is posted on #45.
- Owner decisions:
  - The owner creates the Invisible widget and sets `TURNSTILE_SECRET`.
  - No-JS buyers see a `<noscript>` line that sends them to WhatsApp.
- The boards drew no error state and no no-JS state. Canvas v39 adds the line behind a `noJs` tweak on `Enquiry`, `MobileEnquiry` and `HorseDetail`.
- The first loader pushed a form page to 1056 bytes of inline JS, over the 1 KB budget. It was compacted to 875 bytes.
- A headless Chrome run over CDP against `npm run dev` showed:
  - `api.js` is not loaded before a focus, and is loaded once after one.
  - Both forms get `XXXX.DUMMY.TOKEN.XXXX`.
  - With JavaScript on, the actions sit exactly 42 px under the fields. The widget is `position: absolute`, so the empty div adds no flex gap.
- `ticket-reviewer` found two high findings, and both were real:
  - Gating the loader on `e.target.form` also fired it for the gallery's and the menu's `<form method="dialog">` close buttons. The loader now checks for `.cf-turnstile` in the form.
  - The deploy note did not say that the real sitekey has to be live before the Function deploys. It says so now.
- #59 (the RODO notice) gains a checklist line: name Turnstile as a Cloudflare role separate from the media one.

## What was built — 2026-09-28

- **Forms.** `EnquiryForm.astro` and the search form in `EnquiryPage.astro` each carry:
  - a `cf-turnstile` div, which implicit render fills with `cf-turnstile-response`;
  - a `<noscript>` line, `enquiryForm.noscript`, in both dictionaries.
- **Loader.** The one inline script appends `challenges.cloudflare.com/turnstile/v0/api.js` on the first `focusin` inside a form that holds the widget.
- **Sitekey.** `turnstileSitekey` is in `src/site.ts`. `npm run dev` uses the invisible test key `1x00000000000000000000BB`. The build still uses `PLACEHOLDER-turnstile-sitekey`.
- **Function.** `submitEnquiry` runs these checks in order:
  1. 405 for anything but POST.
  2. The limit of 5 posts per IP an hour.
  3. The traps, answered with a silent 303.
  4. 400 when the parse fails.
  5. `human(token)` calls siteverify with a 5 s timeout. It fails closed, and a failure gives 403.
  6. The global cap: 20 verified posts an hour, else 429.
  7. The write.
- **Tests.** `functions/.secret.local` holds Cloudflare's public always-pass test secret, which the emulator reads. `tests/enquiry.test.mjs` posts the dummy token. It adds a tokenless 403 with no write, and a flood from forged `Fastly-Client-IP` addresses that stops at 20. 46/46 pass.

## Outcome — 2026-09-28

- **Approach:** the invisible Turnstile loads lazily, siteverify runs before any write, and the global cap counts only verified posts. The no-JS fallback is the WhatsApp link.
- **Rejected:**
  - Accepting tokenless posts: a bot would leave the token out.
  - Loading `api.js` eagerly: every horse page view would reach Cloudflare.
  - Guessing the real IP from the `X-Forwarded-For` order: nothing documents which entry is trustworthy.
  - A counter in the database: it costs a write per request. It stays the upgrade path.
- **Traps for next time:**
  - The PLACEHOLDER sitekey has to be replaced, and that hosting has to deploy, **before** `submitEnquiry` deploys with `TURNSTILE_SECRET`. The other order gives every real enquiry a 403.
  - Preview channel hostnames are not on the widget, so a preview form cannot send once the Function is live.
  - The test secret accepts only the dummy token, and a real secret rejects it. `npm test` reaches Cloudflare over the network.
  - A new `<form method="dialog">` is safe. A new form that holds `.cf-turnstile` triggers the loader.
