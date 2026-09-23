# E2.4 · Admin horse editor — #19

Shipped 2026-09-23.

## 2026-09-23

- Approach comment posted on #19. Branch `19-e24-admin-horse-editor`.
- Next: schema, site.ts, horse-form.ts, admin UI, strings, test.
- Built: schema `status`/`order`, `site.ts` sort + available count, `src/horse-form.ts`,
  editor in `/admin`, strings in both locales, 3 round-trip tests.
- `npm run ci` green, `node --test tests/horse.test.mjs` 8/8. Every `toFields` path has a
  control in `dist/admin/index.html`. Admin chunk 103 KB → 326 KB (zod + `firebase/database`),
  still the only page with an `_astro` script.
- ticket-reviewer: clear.

## What was built — 2026-09-23

## Context

#19: "Create, edit, reorder and change the status of a horse. Every field of the content
model, Polish and English side by side." No comments. Blocker #18 (E2.3 admin shell) closed.
`/admin` today = sign-in + empty shell (`a.horsesSoon` placeholder). No artboard for admin
(E2.3 decision: not public UI, built plain on tokens) — no board read, no design ticket.

Schema gap: `src/horse.ts` has no `status` and no `order` ("`status` arrives with E2.8" —
wrong now: #19 needs it, and #23 is blocked by #19). Master plan lists identity as
`order`, `status` (`available | reserved | sold`).

Neighbours own: photo upload #20, X-ray PDF upload #70, publish #21, sold page treatment #23.

## Approach

1. **Schema** `src/horse.ts`: add
   `status: z.enum(['available','reserved','sold']).default('available')`,
   `order: z.number().int().nonnegative().default(0)`. Defaults, so the seeded prod horse
   and `fixture.json` parse unchanged — no prod write. Fix the stale `status` comment.
2. **Public effect, minimal** `src/site.ts`: sort by `order`; `horsesAvailable` counts
   `status === 'available'`; `featuredHorse` = first available by order. Sold horse page
   still renders as today — its treatment is #23. `ponytail:` comments updated.
3. **Form <-> horse, pure** new `src/horse-form.ts` (no DOM, testable):
   - Field names are dotted paths: `name`, `facts.breeding.pl`, `xrays.count`.
   - `toFields(raw)` flattens a horse. `suits`/`notFor` become two textareas (`suits.pl`,
     `suits.en`), one item per line. `videos`, `photos`, `xrays.files` become pretty JSON.
   - `fromFields(fields)` unflattens. Line fields zip PL and EN by index (a count mismatch
     leaves `undefined`, and zod reports `suits.1.en`). Bad JSON stays a string, so zod
     reports it at that path. An empty `xrays.count` with no files sets `xrays: null`.
   - Validation = `horseSchema.safeParse` in the page, the same schema the build uses, so
     the editor cannot write a horse that breaks `astro build`. Rules stay who-not-what (E2.1).
4. **Panel** `src/pages/admin.astro` (markup + script, no framework):
   - List: `onValue('/horses')` renders an `<ol>`, sorted by `order` then slug. Each row
     shows the name, the status label, "Edit", and up/down buttons with `aria-label`.
     A move rewrites every `order` as 0..n-1 in one multi-path `update()`, so equal
     defaults cannot get stuck. "Add horse" sits above the list.
   - Form: one `<form>`, fieldsets per group. The PL/EN pair = `<fieldset><legend>` with
     two `<textarea>`s, the EN one `lang="en"`. Facts loop over
     `Object.keys(horseSchema.shape.facts.shape)`. Enums use `<select>`, dates use
     `type=date`, numbers use `type=number step=1 min=1 required` where the schema demands
     it. An empty price means "on request" (`null`).
   - Slug: its own input with no `name`, so it never enters the horse. Required with
     pattern `[a-z0-9]+(-[a-z0-9]+)*` on create. Read-only on edit, because the URL
     persists forever (#23). Create refuses a slug that already exists. A new horse gets
     `order = max + 1`. An edit keeps the stored `order`.
   - Save: `safeParse`, then the issues go to a `role="alert"` list keyed by field path,
     with focus on the first field found. Otherwise
     `set('horses/<slug>', JSON.parse(JSON.stringify(data)))`, which strips `undefined`
     (RTDB rejects it). Then the panel goes back to the list. Cancel goes back to the list.
   - SDK: add `firebase/database`. It still lands only in the admin chunk.
   - A shared `field(path, label)` loop in the frontmatter keeps the markup short. No new
     component files.
5. **Strings**: an `admin.fields` block (flat keys `"facts.breeding"`), `admin.options`
   (the enum labels), and the list/form/button/error strings. They go in **both**
   `pl.json` and `en.json`, and the unused `horsesSoon` is removed.
6. **Check**: extend `tests/horse.test.mjs` with 3 cases, which run under `npm test`
   and also plain `node --test`:
   - a full horse round-trips through `toFields`/`fromFields`
   - a blank X-ray block gives `null`, and an empty price gives `null`
   - PL/EN line lists of different lengths fail the parse

## Skipped (ponytail)

- Delete: not asked. A sold horse keeps its URL (#23).
- Real controls for videos, photos and X-ray files: these are JSON textareas until #20 and
  #70 replace them. `ponytail:` marks it.
- `publishedAt`: nothing reads it yet.
- Unsaved-change guard and concurrent-edit locking: there is one user.
- Zod messages stay English, prefixed by the Polish field path.

## Files

- edit: `src/horse.ts`, `src/site.ts`, `src/pages/admin.astro`, `src/i18n/pl.json`,
  `src/i18n/en.json`, `tests/horse.test.mjs`, `.claude/tickets/INDEX.md` (at finalize:
  state row + decision line — status/order defaults, validation in the client via the
  build's own schema)
- new: `src/horse-form.ts`, `.claude/tickets/E2.4/` (INDEX, plans/01, followup)

## Process

Approach comment on #19, then `gh issue develop 19 --base main --checkout`, then copy
this plan into `.claude/tickets/E2.4/`, then build, then `npm run ci` and
`node --test tests/horse.test.mjs`, then `ticket-reviewer`, then `create-pr`
(`Closes #19`, notes finalized in the same PR), then the outcome comment.

## Verification

- `npm run ci` is green (format, types, build, links, a11y).
- `node --test tests/horse.test.mjs` is green.
- Isolation: `grep -rl firebase dist --include='*.html'` returns only `dist/admin/index.html`.
- `npm run dev` at `/admin`: sign in, then add a horse, edit it, reorder it, set it to
  sold, and confirm the stock count drops on the next build. Test against the preview
  channel or prod DB only with the owner's go-ahead, because a write there is real data.
  Fallback: the database emulator with `demo-hv`.

## Outcome — 2026-09-23

- Shipped as planned. The approach is on #19.
- Rejected: a form generated by walking zod internals, a component per field type,
  validation in the rules, delete, and `publishedAt`.
- Traps for next time:
  - A move rewrites every `order`. The seeded horses all default to `0`, so a swap of two
    values would do nothing.
  - `set()` rejects `undefined` anywhere, so the parsed horse goes through `JSON` first.
  - The slug is `Object.hasOwn`-checked, because `'constructor' in {}` is true and
    `constructor` passes the slug pattern.
  - `status: sold` only drops the horse from the count and the featured line. Its page is
    unchanged until #23.
  - The editor writes to the live database from any channel, preview included, because
    `src/firebase.ts` is one config. The build only picks the change up at the next deploy (#21).
