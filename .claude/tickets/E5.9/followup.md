# E5.9 — followup

Shipped 2026-10-03 — see the last `## Outcome` at the bottom.

## 2026-10-03

- Board read: signup drawn nowhere. `notify.*` strings = scaffold leftovers. Owner picked placement: horses index + sold page; sending: auto after deploy.
- Owner also wants timed popup. Deferred → #147 (E0.7): dismissal memory = device storage (ePrivacy / PKE art. 399), privacy notice promises nothing stored; no board; JS budget.
- Email links never act on GET (scanner prefetch) → static page + button, token in fragment.
- Built functions/subscribe.js + `newHorses` / `subscribersCleanup`, NotifyForm, NotifyPage ×12 routes, privacy text. `npm run ci` green, `npm test` 68/68.
- Signup form sits as own light band _after_ sold dark band, not inside it — no dark variant needed. `.sold + .band` spacing rule retargeted to `.sold + :global(.notify) + .band`.
- Trap: emulator loads `database.rules.json` into `demo-hv` ns only; Functions write `hanna-vavilava-site-default-rtdb` → `orderByChild('email')` throws "Index not defined". Test PUTs rules into that ns first. Router now catches throws → 303 failed (announce → 500 so deploy curl fails).
- Time trap (`elapsed`) skipped on signup: EnquiryForm's delegated submit handler fills `page`/`ref` on any form with `elapsed` and would throw. Honeypot + Turnstile + limits cover it.
- Canvas v52: signup band on Horses, MobileHorses, HorseDetailSold, MobileDetailSold; new NotifyPages + MobileNotifyPages; Privacy/MobilePrivacy copy; HorsesGrid, Icons, Privacy moved down. ticket-reviewer: clear.

next: none — shipped.

## What was built — 2026-10-03

**Problem.** #48: email list for new horses — unbundled opt-in, never pre-ticked, never in the enquiry form, stored consent timestamp, double opt-in, working unsubscribe. No board drew it; `/subscribers` already existed admin-only (E2.1: list fills only through a Function).

**Steps.**

1. `functions/subscribe.js` (pure): `parseSignup` (zod, email trimmed+lowercased, `consent === 'yes'`), `confirmEmail` / `announceEmail` PL/EN plain text with operator footer, `paths(locale)` mirroring `routes.ts`, `toAnnounce(horses, announced)` (no `/announced` → seed non-sold, send nothing; else new `available` slugs).
2. `functions/index.js`: `resend()` helper (enquiry email reuses it); `matches()` timing-safe compare (`isProbe` reuses it); `newHorses` onRequest behind `/api/notify{,/**}` rewrite, routes `/`, `/confirm`, `/unsubscribe`, `/announce`:
   - subscribe: own per-IP 5/h + 20 verified/h counters, honeypot → sent page, Turnstile `human()`, lookup `orderByChild('email')`; confirmed or <10 min old → same sent page, no mail; else `/subscribers/<randomBytes(24) base64url>` `{email, locale, createdAt}`, Resend confirmation, send fail → delete record + failed page.
   - confirm: POST `t`, ≤7 days → `confirmedAt` server timestamp; idempotent.
   - unsubscribe: POST `t` (body, or query for RFC 8058 one-click → 200) → remove record.
   - announce: `X-Announce` vs `ANNOUNCE_TOKEN`; mark `/announced` first, then Resend `/emails/batch` ×100 with `List-Unsubscribe` + `List-Unsubscribe-Post`. At-most-once.
   - any throw → 303 failed page (announce → 500).
   - `subscribersCleanup` daily 04:00 Warsaw: delete unconfirmed > 7 days.
3. Config: `firebase.json` rewrite; rules `.indexOn: ["email"]` + admin-only `/announced`; `monitoring/errors.policy.json` covers `newhorses`, `subscriberscleanup`; `deploy.yml` step curls announce after hosting deploy, skipped without the secret; `.secret.local` emulator `ANNOUNCE_TOKEN`.
4. Site: `NotifyForm.astro` (email, required unticked consent naming `operator.name`, privacy link, honeypot, Turnstile) after the list in `HorsesIndex` and after the sold band in `HorseDetail`; `TurnstileLoader.astro` split out of `EnquiryForm`; `NotifyPage.astro` six states, `noindex`, confirm/unsubscribe copy fragment token into a POST form; 6 route keys × 2 locales under `/powiadomienia/*`, `/en/new-horses/*`, skipped in sitemap.
5. Dictionaries: `notify.consent` reworded with `{operator}`; `pages.notify*`; privacy notice: intro, new data paragraph (consent Art. 6(1)(a) = consent to electronic direct marketing, withdrawal), Firebase + Resend roles, retention, voluntariness, Turnstile covers signup.
6. Tests: `tests/subscribe.test.mjs` (pure + emulator), rules cases for `/subscribers`, `/announced`.
7. Canvas (v52): signup band on 4 boards, `NotifyPages` / `MobileNotifyPages`, privacy copy on both privacy boards.

**Acceptance.** Ticked on #48: separate form on index + sold page; unticked required consent naming sender; double opt-in with 7-day expiry; `confirmedAt` stored; unsubscribe link + one-click in every announcement; privacy notice covers the list; boards at both breakpoints.

## Outcome — 2026-10-03

**Approach:** one `newHorses` Function owns signup, confirm, unsubscribe and announce, so mail and subscriber data never leave Functions; email links land on static pages whose button POSTs, token in the fragment, so scanner prefetch can neither confirm nor unsubscribe.
**Bugs met:** subscribe 500 in emulator → `Index not defined` for `/subscribers` email query, because the emulator applies rules to `demo-hv` only and Functions use `hanna-vavilava-site-default-rtdb` → test PUTs `database.rules.json` into that ns (`tests/subscribe.test.mjs`); router also catches throws so a missing index in production shows the failed page, not a 500.
**Rejected:** GET confirm/unsubscribe (scanners); CI announce script importing i18n (needs Resend key in GitHub + DB-write service account); panel "send" button (owner chose auto); footer placement (Turnstile loader on every page); time trap on signup (EnquiryForm's delegated submit handler would throw); timed popup → #147.
**Traps for next time:** deploy order — `firebase deploy --only database,functions:newHorses,functions:subscribersCleanup` before hosting carries the rewrite; `ANNOUNCE_TOKEN` must be set in both Firebase secrets and GitHub secrets; Resend free plan = 100 mails/day caps one announcement at ~100 subscribers; `functions/subscribe.js` mirrors routes, operator and base URL (#63 changes the domain), held equal only for routes by the test.
**Files that mattered:** `functions/index.js`, `functions/subscribe.js`, `src/components/NotifyForm.astro`, `src/components/NotifyPage.astro`, `tests/subscribe.test.mjs`
