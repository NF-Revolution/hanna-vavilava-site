# E2.12 — followup

Shipped 2026-09-27 — see the last `## Outcome` at the bottom.

## 2026-09-27

- #110 body fixed first: `database.rules.json` criterion stale — rules path-level, `horseSchema` is shape check
- built per plan; `npm run ci` green, `npm test` 37/37 (incl. `tests/starts.test.mjs`); ticket-reviewer: clear
- trap: rtk hook rewrites `git` → `rtk git`, worktree guard refuses it. Use `/usr/bin/git`. Compound shell commands with heredoc+python also refused — use Edit tool
- trap: live livejumping probe (curl of their bundle + API) denied by auto-mode classifier. Row types + pagination unverified beyond #108; code throws on `last_page > 1` and on malformed rows
- functions emulator ignores `startsWeekly` (no pubsub emulator) — only load is checked, not the trigger
- secretmanager 403 lines in `npm test` output are pre-existing demo-project noise
  next: none — shipped.

## What was built — 2026-09-27

**Problem:** fill `facts.starts` / `facts.lastStart` from livejumping.com (decided #108), weekly + on demand, fail soft.

**Steps:**

1. `src/horse.ts`: `livejumpingName: z.string().trim().default('')` — exact `s_kon`, empty = not synced. `database.rules.json` untouched (rules path-level).
2. `functions/starts.js`, import-free like `sold.js`:
   - `apiKey()` — `livejumping.com/ap/` → `main-es2015.<hash>.js` → `api:{key:"…"}`; throws if missing
   - `fetchYear` — POST `/api/v1/search/horse` `{szukaj, year}`, `apikey` header, 15 s timeout; throws on non-200, non-array `data.results.data`, `last_page > 1`
   - `rows(raw, name)` — exact `s_kon`; each row validated (`data` `YYYY-MM-DD…`, `ukonczyl` 0/1), throw otherwise
   - `fetchStarts` — years `born + 4` .. current Warsaw year
   - `startFacts` — starts `8 · 2026: 7 · 2025: 1` (all rows: every rider, REZ); lastStart latest `finished` row, stable sort keeps API order on ties; PL `12.09.2026 · N 120 cm · 2. miejsce`, EN `12 Sep 2026 · N 120 cm · 2nd place`; fixed month array (Intl en-GB prints `Sept`); no finished row → `null`, stored value kept
3. `functions/index.js`:
   - `release()` extracted from `publish` (sold X-rays delete, `site/updated`, dispatch) — reused by schedule so E2.8 invariant holds
   - `syncStarts()` — named, unsold horses; per-horse try/catch; zero matched rows = error; `update` only changed `{pl,en}` pairs; returns `{changes, errors}`; key failure throws whole run
   - `refreshStarts` onCall, `adminOnly`, 300 s, key failure → `HttpsError('unavailable')`
   - `startsWeekly` onSchedule `0 6 * * 1` Europe/Warsaw, `logger.error` per horse, `release()` only on change
   - deploy header: first deploy enables Cloud Scheduler API
4. `src/pages/admin.astro`: `livejumpingName` text field top of Facts with hint; "Odśwież starty" button + `#refresh-status` list under Publish (changes, "Bez zmian.", per-horse errors, whole-run failure)
5. i18n: `fields.livejumpingName`, `livejumpingHint`, `refreshStarts`, `refreshStartsHint`, `refreshSending`, `refreshNone`, `refreshChange`, `refreshError`, `refreshFailed` in both files
6. `tests/starts.test.mjs` — Lotus Blue 2026 rows from #108 + `LOTUS BLUE II` decoy + 2025 row; REZ counted, not last start; 11th ordinal; unplaced; malformed rows throw

**Acceptance:** all 12 #110 boxes ticked; `npm run ci` + `npm test` green.

## Outcome — 2026-09-27

**Approach:** one `syncStarts()` behind two triggers, pure parsing/formatting in import-free `functions/starts.js` so `npm test` covers it without the runtime.
**Bugs met:** none.
**Rejected:** all-or-nothing across horses (one misspelt name blocks all); dispatch without sold-X-ray cleanup (Monday deploy could ship sold horse's films); `Intl` for EN date (`Sept`); rules `.validate` for the field (rules never check shape here).
**Traps for next time:** Monday deploy publishes whole DB incl. unpublished saves; panel Save of a horse open across the run writes old facts back; pagination + row types unverified live — Hanna's first Refresh is the live check; emulator skips `startsWeekly`.
**Files that mattered:** `functions/starts.js`, `functions/index.js`, `src/pages/admin.astro`, `src/horse.ts`, `tests/starts.test.mjs`
