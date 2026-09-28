# E5.3 — followup

Shipped 2026-09-28. See the last `## Outcome` at the bottom.

Issue [#42](https://github.com/NF-Revolution/hanna-vavilava-site/issues/42) ·
branch `42-e53-submitenquiry-endpoint`

## 2026-09-28

- Plan 01 approved. Blockers clear (#16 and #40 are closed).
- Owner decisions:
  - The rate limit lives here, in memory, with `maxInstances: 1`. #45 keeps Turnstile and was retitled `E5.6 · Turnstile`.
  - The time trap is an inline script, and it is skipped when JS is off.
  - Claude deploys the Function before the PR opens, because a rewrite to a missing Function fails the preview deploy.
- The `src/horse.ts` note that said "submitEnquiry imports this" was a stale guess. The Function never needs the horse schema, so the note is gone.
- `npm test` logs Secret Manager 403s for `PUBLISH_TOKEN` and `CLOUDFLARE_TOKEN` on `demo-hv`. This is emulator noise from the existing Functions, and the tests still pass.
- Context7 did not document which header carries the client IP through Hosting. The code reads `fastly-client-ip` first, then the first `X-Forwarded-For` entry.
- `ticket-reviewer` found one blocker: the Function was not deployed yet. That was the planned next step. After the deploy, the live URL answers GET 405 and a junk POST 400, and nothing was written.

## What was built — 2026-09-28

- `functions/enquiry.js` is pure, with no Firebase. It holds:
  - `enquirySchema` on `zod` ^4, added to `functions/package.json`, with the fields exactly as the 2026-09-28 comment on #42 lists them.
  - `parseEnquiry`: it returns the record or `null`, strips unknown keys and drops empty optional fields.
  - `sentPath`, which mirrors `enquirySent` in `routes.ts`.
  - `whatsapp` is stored bare (`+48600123456`). `instagram` is cut down to the handle.
- `submitEnquiry` is `onRequest` in `europe-central2` with `maxInstances: 1`. The checks run in this order:
  1. 405 for anything but POST.
  2. 429 after 5 posts per IP in an hourly in-memory window.
  3. A silent 303 with no write for a filled honeypot (`website`), or for `elapsed` under 3000 ms.
  4. 400 when the parse fails.
  5. `push()` under `/enquiries` with `createdAt: ServerValue.TIMESTAMP`, never `handled`, and `locale` kept for #43.
  6. A 303 to `sentPath[locale]`. A write error gives 500 and a `logger.error`.
- `firebase.json` rewrites `/api/enquiry` to the Function, before `/en/**`.
- `EnquiryForm.astro` has a hidden `locale`, a hidden `elapsed`, an off-screen `aria-hidden` honeypot out of the tab order, and one inline submit listener. The dictionaries gain `enquiryForm.trap`.
- `tests/enquiry.test.mjs` covers parsing and Instagram normalisation. It checks that the schema's select codes equal both dictionaries' keys. An emulator run covers a stored record, both traps, 400, 405 and 429.

## Outcome — 2026-09-28

- **Approach:** a plain form POST answered by a 303 is the only path. Validation, the traps and the limit all live in one Function, and no IP is stored.
- **Rejected:** a rate-limit counter in the database (a write per request, and a stored IP), and a time trap without JS (a static page cannot stamp its render time).
- **Traps for next time:**
  - Deploy `submitEnquiry` before any hosting deploy that carries the rewrite. Neither `preview.yml` nor `deploy.yml` deploys Functions. A Function change also reaches production only by a hand deploy.
  - The in-memory limit resets on a cold start. A caller of the direct `cloudfunctions.net` URL can forge the forwarded IP. #45 is where that closes.
  - If Hosting ever stops sending `fastly-client-ip` and `X-Forwarded-For`, every visitor shares `req.ip`, the edge address, and the whole site gets 5 enquiries an hour. Check the header after any Hosting change.
  - `functions/` cannot import `src/`, so `sentPath` and the select codes are mirrored. The test guards the codes but not the paths.
