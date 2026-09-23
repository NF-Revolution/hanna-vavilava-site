# E2.2 — followup

Shipped 2026-09-23 — see the last `## Outcome` at the bottom.

Issue [#17](https://github.com/NF-Revolution/hanna-vavilava-site/issues/17) ·
branch `17-e22-build-time-content-loader`

## 2026-09-23 — built

- Loader, fixture, `site.ts` seam, `media.ts`, horse routes, homepage guards. `npm run ci` green.
- Negative check: an `owner` key in the fixture fails the build with `InvalidContentEntryDataError`.
- Empty stable (`horses: {}`) builds 18 pages, header "0 koni", no horse line.
- `github-deploy` SA already holds `roles/firebasedatabase.viewer`, so no grant was needed.
- Prod DB root was `null`. Seeded with `database:update / src/fixture.json` after the user
  approved it. Root is now `{horses, site}`. #24 replaces `/horses`.
- Trap: the real-DB path runs only in `preview.yml`/`deploy.yml`, because the local machine has no key.
- ticket-reviewer found 1 blocker, which was real. The Realtime Database drops `null` and `[]`, so the
  seeded Cascada came back without `xrays`, `videos` and `photos`, and the strict schema failed.
  Fix: `.default(null)` / `.default([])` on every nullable or list field in `horseSchema`, plus a
  test. The real prod record was parsed with the fixed schema and it passes.
- Next: PR, preview build log must show a DB read and a clean exit.

## 2026-09-23

- Blockers #16, #8 closed.
- Owner comment on #17 asked for live fetching, no redeploy per edit. User's call: keep
  build-time; the E2.6 Publish button makes the rebuild automatic. Body fixed, approach comment posted.
- Body stale: images are on R2 (#69), not Firebase Storage.
- Plan 01 approved. Branch created.

## What was built — 2026-09-23

From `plans/01-loader.md`, as approved:

### Context

#17: read the Realtime Database once during the build, feed Astro content collections, replace
the placeholder horse and the standing facts in `src/site.ts`. Blockers #16 and #8 are closed.

The owner's comment asked for live fetching so a horse edit needs no redeploy. **Decided
(2026-09-23): keep build-time.** Hanna never redeploys by hand. The E2.6 Publish button sends
`repository_dispatch`, `deploy.yml` already listens for it, and the change is live in about
1–2 minutes. So the pages stay static, horse URLs stay crawlable, WhatsApp link previews keep
working, public pages keep under 1 KB of JS and the rules stay admin-only.

Stale in the body: "remotePatterns for Storage images". Media moved to R2 in #69, so the image
host is `hv-media.nfrevolution.com`.

No artboard read. The loader changes where the data comes from, not what a page draws. The
two new edge states (no horse, price `null`) go into the decision log.

### Before code

1. Run `ticket-notes`: create `.claude/tickets/E2.2/` with `INDEX.md`, `plans/01-loader.md`
   (this plan) and `followup.md`.
2. Branch: `gh issue develop 17 --base main --checkout`.
3. Fix the #17 body: Storage becomes the R2 media host, and add one line saying live edits
   reach the site through the E2.6 Publish rebuild.
4. Post the approach comment. It answers the owner's question: the Publish button makes the
   rebuild automatic, and why live fetching was rejected (SEO, link previews, JS budget,
   public read rules).

### Build

- **`firebase-admin`** as a devDependency. It is build-only and the ticket names it.
- **`src/content.config.ts`** (new):
  - `siteSchema`, a `z.strictObject` with `whatsapp` (digits only, which wa.me needs),
    `telegram`, `phone`, `email`, `instagram`, `responseWindow` and `updated` (ISO date).
  - A memoised `load()` that reads `/horses` and `/site` in parallel (never the root, which
    holds enquiries and subscribers), then runs `deleteApp` in `finally`. Without it the open
    RTDB socket keeps `astro build` from exiting.
  - The database URL is a constant:
    `https://hanna-vavilava-site-default-rtdb.europe-west1.firebasedatabase.app`.
  - If `FIREBASE_SERVICE_ACCOUNT` is unset, `load()` logs a warning and uses `src/fixture.json`.
    `ci.yml`, forks and local dev have no secret, so they build from the fixture. The fixture
    can never reach live, because the hosting deploy step needs the same secret.
  - Two collections, each an inline loader that returns an object keyed by id. Astro's
    `simpleLoader` removes the key from the data, so the `strictObject` still passes.
    - `horses`: returns `load().horses ?? {}`, parsed by `horseSchema`.
    - `site`: returns `{ site: load().site }`, parsed by `siteSchema`.
- **`src/fixture.json`** (new): `{ horses: { cascada: {…full horseSchema, PLACEHOLDER} },
site: {…today's placeholder facts} }`. The same file seeds the production database (see
  Verify).
- **`src/site.ts`**:
  - Top-level `await getCollection('horses')` and `getEntry('site', 'site')`.
  - Throws if `/site` is missing.
  - `site = { ...facts, horsesAvailable: horses.length, featuredHorse: horses[0] && { slug: id, ...data } }`.
  - `ponytail:` comments: the count covers every horse until E2.8 adds `status`, and the
    featured horse is the first by slug until E2.8 or a featured flag.
  - The href helpers stay unchanged.
- **`src/media.ts`** (new): `site.media` moves here unchanged. Reason: `site.ts` now imports
  `astro:content`, so neither `astro.config.mjs` nor the #26 Node encode script can import it.
  Nothing reads `site.media` today.
- **`astro.config.mjs`**: `image: { domains: [new URL(media.base).hostname] }`.
- **`src/pages/konie/[slug].astro`** and **`src/pages/en/horses/[slug].astro`**:
  `getStaticPaths` maps `getCollection('horses')` to `{ params: { slug: id }, props: { name } }`.
- **`src/components/HomeScreen.astro`**:
  - Use `horse.price`, not `priceEur`.
  - Leave the price segment out when the price is `null`. This adds no new copy. The "on
    request" label arrives with E4.x's boards.
  - Render the bottom-edge horse line only when a horse exists.
- **`src/horse.ts`**: update the comment line about the `/site` schema.
- **`deploy.yml`**: fix the stale "photos from Firebase Storage" comment.
- **`.claude/tickets/INDEX.md`**, new decision lines:
  - build-time plus Publish rebuild, not live fetching
  - fixture fallback without the secret
  - `media.ts` split
  - the homepage's no-horse and no-price states

### Verify

1. `npm run ci` is green. This build runs from the fixture, so the fixture is schema-checked on
   every CI run.
2. Break a fixture field on purpose and confirm that the build fails with Astro's parse error.
   Then revert it.
3. **Outward, and I ask first each time:**
   - Check that the service account behind `FIREBASE_SERVICE_ACCOUNT` has
     `roles/firebasedatabase.viewer` (`gcloud projects get-iam-policy`). Grant it if missing.
   - Seed production with
     `npx firebase-tools@15 database:update / src/fixture.json --project hanna-vavilava-site`.
     This is a PATCH that touches only `horses` and `site`. Without `/site` the next deploy
     fails. E2.9 later replaces `/horses` with the real four.
4. The PR preview build (`preview.yml` passes the secret) is the real-database check. It must
   read the database, exit cleanly, and the preview must show Cascada.
5. `ticket-reviewer` on the diff. Then `create-pr`, `ticket-notes` finalize, and the outcome
   comment.
6. Note on #21 (E2.6), through the `ticket` skill: Publish should stamp `/site/updated`.

Skipped: live fetching (rejected above), an emulator path for the loader (the fixture covers
it), and the "on request" price label (E4.x).

## Outcome — 2026-09-23

- **Approach**: build-time read through `firebase-admin` into two content collections. Live
  fetching was rejected (owner asked, user decided): the E2.6 Publish rebuild covers "no redeploy".
- **Built as planned**, plus one reviewer fix: `horseSchema` defaults every nullable or list field.
  The Realtime Database stores neither `null` nor `[]`, so a record read back loses those keys.
  Every future reader of `/horses` (E2.4 editor, E5.3) inherits the fix through the schema.
- **Outward**: prod DB seeded from `src/fixture.json` (`horses/cascada`, `site`). `github-deploy`
  already had `roles/firebasedatabase.viewer`. #21 gained a checklist with a `/site/updated` stamp.
- **Traps for next time**:
  - The real-DB path runs only in `preview.yml`/`deploy.yml`. The fixture build cannot catch
    RTDB-shape bugs; parse a `database:get` dump instead.
  - Forget `deleteApp` and `astro build` hangs on the open socket.
  - `site.ts` imports `astro:content`: plain Node and `astro.config.mjs` must import `media.ts`.
  - `npm audit`: 2 moderate (`uuid` via `gaxios`, through firebase-admin). Build-only, not fixed.
