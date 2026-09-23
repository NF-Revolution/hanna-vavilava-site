# E2.3 · Admin shell — #18

Shipped 2026-09-23.

## 2026-09-23

- Approach comment posted on #18. Branch `18-e23-admin-shell`.
- `npm run ci` is green: 21 pages, and the a11y baseline covers `/admin`.
- Only `dist/admin/index.html` references an `_astro` chunk (103 KB). Public pages are unchanged.
- The Email/Password provider is on. A bogus sign-in returns `INVALID_LOGIN_CREDENTIALS`, not `OPERATION_NOT_ALLOWED`.
- ticket-reviewer: clear.

## What was built — 2026-09-23

## Context

#18: one client-rendered `/admin` route, Firebase Auth email+password, single account,
noindex + robots-blocked, Firebase SDK isolated from public pages. Blocker #16 closed.
E2.1 left the trap: rules grant everything on `auth.token.admin === true`, so the account
needs that custom claim or the panel reads nothing. This ticket = sign-in + frame only;
horse editing is later E2 tickets.

Findings:

- No artboard draws admin. Admin is not public UI → no board, no design ticket. Built plain
  on existing tokens; one line in `.claude/tickets/INDEX.md` decisions.
- #18's comment (add `-4baa3.web.app` to authorized domains) is stale: E1.3 established the
  default Hosting site is `hanna-vavilava-site`, and `hanna-vavilava-site.web.app` is
  already authorized. No console change. Say so in the approach comment.
- `firebase.json` already has `/admin/**` X-Robots-Tag, but with `cleanUrls` +
  `trailingSlash: false` the page is served at `/admin`, which that glob may not match.
- Local machine has no service-account key and no ADC; `gcloud` is installed.
- One web app: `1:894554818339:web:711eb3aafb557b44ebae96`; config via `apps:sdkconfig`.

## Approach

1. `npm i firebase` (dependency). Only `/admin`'s bundled `<script>` imports it → Vite puts it
   in an admin-only chunk. No island, no framework.
2. `src/pages/admin.astro` — standalone page, not `Base.astro` (Base adds canonical,
   hreflang, og tags keyed on a `routeKey`; admin must have none, and must not enter
   `routes.ts`, which would give it a `/en/admin` twin and hreflang).
   - `<html lang="pl-PL">`, `<meta name="robots" content="noindex, nofollow">`, fonts.css +
     base.css, skip link, `<main id="main">`, one static `<h1>` — passes `check-a11y`.
   - Three blocks toggled by `hidden`: sign-in `<form>` (email, password, labelled inputs,
     `autocomplete`, submit, `role="alert"` error `<p>`); "no access" block (signed in,
     no claim) with sign-out; signed-in shell (email + sign-out, placeholder line for
     the horse list — `ponytail:` comment naming the ticket that fills it).
   - `<script>`: `initializeApp(config)`, `getAuth`, `onAuthStateChanged` →
     `user.getIdTokenResult(true)` (force refresh, so a claim granted after sign-in is seen
     without re-login) → pick block. Submit → `signInWithEmailAndPassword`; map
     `auth/invalid-credential`, `auth/too-many-requests`, else generic.
3. Config: `src/firebase.ts` exports the web config constants (public by design — the API
   key is an identifier, rules are the lock). Values from
   `npx firebase-tools@15 apps:sdkconfig WEB 1:894554818339:web:711eb3aafb557b44ebae96`.
   `databaseURL` included for the next tickets. Rejected: `/__/firebase/init.json` (absent
   on `npm run dev`), env vars (no secret to hide, one more thing to forget in CI).
4. Strings: `admin` block in `src/i18n/pl.json` and `en.json` (structure enforced by
   `src/i18n/index.ts`). Page renders `t('pl')`; script does
   `import { admin } from '../i18n/pl.json'` for error text. `ponytail:` Polish only —
   one user; EN switch if Hanna wants it.
5. Robots: `public/robots.txt` = `User-agent: *` / `Disallow: /admin`. E6.4 replaces it
   (sitemap, preview `Disallow: /`). `firebase.json` header source → `/admin{,/**}`.
6. Claim: `scripts/grant-admin.mjs <email>` — `firebase-admin` (already devDep) with ADC,
   `getUserByEmail` → `setCustomUserClaims(uid, { admin: true })`. Package script
   `"admin:grant"`. Account itself created in console (Auth → Users → Add user).

## Files

- new: `src/pages/admin.astro`, `src/firebase.ts`, `scripts/grant-admin.mjs`, `public/robots.txt`
- edit: `package.json` (+`firebase`, `admin:grant`), `src/i18n/pl.json`, `src/i18n/en.json`,
  `firebase.json`, `.claude/tickets/INDEX.md` (state row + decisions line), `README.md`
  if it lists commands
- notes: `.claude/tickets/E2.3/` (INDEX, plans/01-admin-shell.md, followup.md), finalized at PR

## Process (ticket-implement)

Approach comment on #18 → `gh issue develop 18 --base main --checkout` → build →
`npm run ci` → `ticket-reviewer` → `create-pr` (`Closes #18`) → outcome comment.

## Verification

- `npm run ci` green (format, types, build, links, a11y incl. `/admin`).
- Isolation: `grep -rl firebase dist --include=*.html` → only `dist/admin/index.html`
  references the firebase chunk; public pages' JS unchanged.
- `npm run dev`, open `/admin`: form shows; wrong password → error text; (with a real
  account) sign-in → "no access" until claim, → shell after `npm run admin:grant`; sign-out
  returns to form. localhost is an authorized domain.
- Preview channel on the PR: same flow on the `.web.app` preview URL (preview domains are
  not authorized by default — if `auth/unauthorized-domain`, note it; prod domain is fine).

## Outward steps — only after user confirms

- Email/Password provider enabled in Auth (check console).
- Hanna's account created; email is the owner's to give.
- `gcloud auth application-default login` (user runs `! …`), then
  `npm run admin:grant -- <email>`.

## Outcome — 2026-09-23

- Shipped as planned. README was not touched, because its command list is only dev and ci.
- Rejected: `Base.astro` with an opt-out flag, `/__/firebase/init.json`, `PUBLIC_*` env vars,
  the Auth emulator, and an entry in `routes.ts`.
- Traps for next time:
  - A scoped `display: grid` beats the `hidden` attribute, so the rule targets `:not([hidden])`.
  - zsh drops `grep --include=*.html` with a glob error. Quote the pattern.
  - Preview-channel domains are not authorized, so sign-in fails on a PR preview. Test on
    localhost or production.
  - The account shows "no access" until `npm run admin:grant -- <email>` has run. That needs
    `gcloud auth application-default login` first, because this machine has no key.
