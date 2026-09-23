# E1.11 — followup

Shipped 2026-09-23 — see the last `## Outcome` at the bottom.

Issue [#69](https://github.com/NF-Revolution/hanna-vavilava-site/issues/69) ·
branch `69-e111-cloudflare-account-r2-bucket-and-media-subdomain`

## 2026-09-23 — built

- R2 enabled and `wrangler login` done by the user. Zone id `7316aefb061602d151fafa6889e201b3`,
  read from the API with `wrangler auth token` — no dashboard trip needed.
- `r2 bucket create hanna-vavilava-media --location eeur`; `r2 bucket domain add … --min-tls 1.2`.
  Certificate went `pending` to `active` in about five minutes: Google Trust Services WE1,
  SAN `hv-media.nfrevolution.com`, expires 2026-12-22 (auto-renewed by Cloudflare).
- Probe `_probe/probe-f523cfe2.mp4`, 10 s 720p ffmpeg testsrc2, 3 501 456 bytes, `+faststart`:
  - HEAD `200`, `cache-control: public, max-age=31536000, immutable`, `accept-ranges: bytes`,
    `cf-ray …-WAW` (proxied, Warsaw edge).
  - `Range: bytes=0-1` → `206 bytes 0-1/3501456` (Safari's probe); `0-99` and `2000000-` → `206`.
  - `/` and `/?list-type=2` → `404`; unauthenticated `PUT` and `DELETE` → `401`. Dev URL disabled.
  - Apex and `www` A records unchanged: `104.21.51.239`, `172.67.191.182`.
- `node -e "import('./src/site.ts')"` loads `site.media` with no flag and no warning on 22.22.
- `npm run ci` green. `ticket-reviewer`: clear, all seven criteria met.
- User scrubbed the probe in Safari and Chrome: plays. Probe deleted from the bucket; all seven boxes ticked on #69.

## 2026-09-23

- Blockers clear. Plan 01 approved.
- Body criterion "Firebase Hosting still serving the apex" is stale: the `nfrevolution.com`
  apex is the unrelated brand, proxied by Cloudflare (`104.21.51.239`), and Firebase rides
  `.web.app` until #63. Reworded on the issue before building.
- Issue body reworded, approach comment posted. `site.media` block and README `## Media` written.
- Apex baseline before any change: `nfrevolution.com` A = `104.21.51.239`, `172.67.191.182`; `hv-media` did not resolve.
- `wrangler` 4.136.3 via npx: not authenticated.
- Next: user enables R2 and runs `npx wrangler@4 login`; then bucket, domain, probe.

## What was built — 2026-09-23

From `plans/01-r2-setup.md`, as approved:

### Context

Video clips, posters and X-ray PDFs need a home with free egress (decided in #1, #4).
R2 bucket + custom domain `hv-media.nfrevolution.com` (zone already on Cloudflare NS:
`merlin`/`kiki`). Mostly ops work; repo change is small: record bucket name + media base
where #26's encode script can import them. No visitor-visible change → no artboard work.
Blockers: none (issue-reader: clear).

Stale criterion: "Firebase Hosting still serving the apex". `nfrevolution.com` apex is the
unrelated brand, proxied by Cloudflare (104.21.51.239), not Firebase — Firebase rides
`.web.app` until #63. Reword before building (skill rule: fix ticket first) to:
"No existing `nfrevolution.com` record changes — the custom domain adds one record for its
own label. The apex-vs-Firebase certificate question belongs to #63."

### Steps

1. **Ticket notes** — create `.claude/tickets/E1.11/` (`INDEX.md`, `plans/01-r2-setup.md` = this plan, `followup.md`).
2. **Fix issue body** (criterion above), then **approach comment** on #69.
3. **Branch** — `gh issue develop 69 --base main --checkout`.
4. **User does (interactive / dashboard, cannot script):**
   - R2 enabled on the Cloudflare account (payment method, accept R2 plan).
   - `! npx wrangler@4 login` (OAuth in browser).
5. **I run (wrangler via `npx wrangler@4`, no devDependency — CI never needs it):**
   - `wrangler r2 bucket create hanna-vavilava-media --location eeur` (Warsaw nearest; no EU jurisdiction — public, non-personal assets, and `-J eu` would tax every later command).
   - `wrangler r2 bucket domain add hanna-vavilava-media --domain hv-media.nfrevolution.com --zone-id <id>` (zone id from `wrangler`/dashboard; ask user if not listable). Public dev URL stays disabled.
6. **Verify with a real file** — `ffmpeg` 5 s test mp4 (`-movflags +faststart`), key content-addressed `_probe/<sha8>.mp4`, uploaded with
   `--cache-control "public, max-age=31536000, immutable" --content-type video/mp4`. Then:
   - `curl -sI https://hv-media…/_probe/<sha8>.mp4` → 200, `cache-control` immutable, `accept-ranges: bytes`, cert valid, `cf-ray` present (proxied).
   - `curl -s -r 0-99 -D- -o /dev/null …` → `206`, `content-range: bytes 0-99/<size>`.
   - `curl -sI https://hv-media…/` → 404 (not listable); `curl -X PUT …` → 4xx (not writable).
   - User opens URL in Safari + Chrome and scrubs.
   - `dig` apex before/after identical.
   - Delete probe object — bucket starts clean.
7. **Repo change** — `src/site.ts`, one block, no helper (no consumer yet; #26/#23 add `mediaUrl(key)` when they need it):
   ```ts
   /*
    * Cloudflare R2 (#69). The site stores object keys, never URLs — #63 changes
    * `base` to https://media.hannavavilava.com and nothing else. Keys are
    * content-addressed (`<slug>/<name>-<sha8>.<ext>`) and never overwritten, so
    * every upload carries `cacheControl`. Node ≥22.18 strips types, so the
    * encode script (#26) imports this file directly.
    */
   media: {
     base: 'https://hv-media.nfrevolution.com',
     bucket: 'hanna-vavilava-media',
     cacheControl: 'public, max-age=31536000, immutable',
   },
   ```
   README: one short "Media" paragraph — bucket, domain, `npx wrangler@4 login`, upload flags.
   `.claude/tickets/INDEX.md`: row `E1.11 media bucket | #69 | done — hanna-vavilava-media on hv-media.nfrevolution.com` + one decision line (eeur, no jurisdiction, cache-control at upload not a transform rule, wrangler via npx).
8. `npm run ci` → tick issue checkboxes → `ticket-reviewer` → finalize ticket notes → `create-pr` → outcome comment.

### Skipped (ponytail)

- CORS rules — `<video>`, `poster`, `<a href>` PDFs need none. Add if a `crossorigin` fetch appears.
- Cache Rule / Transform Rule forcing `Cache-Control` at the edge — metadata at upload covers it; add if a second uploader appears.
- `wrangler` devDependency / `wrangler.jsonc` — no Worker, no CI use.

### Verification

curl checks in step 6 (results pasted into `followup.md` and outcome comment), Safari/Chrome
scrub by user, `npm run ci` green.

## Outcome — 2026-09-23

- **Approach chosen:** bucket `hanna-vavilava-media` (`eeur`), custom domain
  `hv-media.nfrevolution.com` at TLS 1.2+, `.r2.dev` disabled, `Cache-Control` as upload
  metadata, one `site.media` block that Node imports straight from `src/site.ts`. Shipped as
  planned; the only repo change is that block, a README `## Media` section and the decision line.
- **Rejected:** EU jurisdiction bucket, an edge Transform Rule for `Cache-Control`, CORS rules,
  `wrangler` as a devDependency — reasons in plan 01 and the approach comment on #69.
- **Stale criterion:** "Firebase Hosting still serving the apex" did not apply to
  `nfrevolution.com`; reworded on the issue before building.
- **Trap — deleting an object does not unpublish it.** After `r2 object delete` the probe
  still answered `200` with `cf-cache-status: HIT`: the edge keeps a cached copy for as long
  as the immutable header allows. Anything that must disappear — the X-rays when a horse
  sells (#23) — needs a cache purge by URL after the delete. The `wrangler login` OAuth token
  cannot purge (`Authentication error`, code 10000); that takes an API token with
  `Zone · Cache Purge` or the dashboard's Custom Purge.
- **Trap — zone id.** `wrangler r2 bucket domain add` requires `--zone-id`; it came from
  `GET /zones?name=nfrevolution.com` with the `wrangler auth token` bearer.
- **Trap — certificate lag.** The domain answers only after `ssl_status` goes `active`, about
  five minutes after `domain add`. Poll `r2 bucket domain list`.
