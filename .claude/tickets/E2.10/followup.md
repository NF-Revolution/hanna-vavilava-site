# E2.10 · Admin X-ray PDF upload

Shipped 2026-09-25 — see the last `## Outcome` at the bottom.

Issue [#70](https://github.com/NF-Revolution/hanna-vavilava-site/issues/70) · branch `70-e210-admin-x-ray-pdf-upload`

## 2026-09-25 — reopened

- The issue was closed on 2026-09-25 with no pull request, no comments and every box
  unticked. `xrays.files` was still a JSON textarea. It was reopened with the approach
  comment.

## What was built — 2026-09-25

- `functions/presign.js`: a SigV4 query-string presign, about 30 lines of `node:crypto`.
  `tests/presign.test.mjs` pins it to AWS's worked example signature (`aeeed9bb…`).
- `functions/index.js`: `xrayUpload` validates `{ slug, takenOn, bytes }`, rejects over
  100 MiB, builds the key and returns `{ key, url, headers }`. `xrayDelete` accepts only keys
  matching `horses/<slug>/xrays/*.pdf`, deletes and purges them. That is E2.8's code, pulled
  out of `deleteSoldXrays` as `deleteXrays(keys)`. `adminOnly()` is shared by all three
  callables.
- `src/pages/admin.astro`: the X-ray section has an owner-check tick that enables the file
  input and resets after every batch. Then the PUT with the signed headers, a `HEAD` read-back
  on `hv-media…`, and a row with the link and size, an optional PL/EN label and Remove.
  Removal lands on Save, before the database write. Cancel deletes unsaved uploads.
- `src/horse-form.ts`: `xrays.files` is rows of dotted fields (`xrays.files.0.key`), no longer
  JSON. Two empty label halves drop the label.
- `r2.cors.json`: PUT and HEAD from `hanna-vavilava-site.web.app`, `.firebaseapp.com` and
  `localhost:4321`.

## Outcome — 2026-09-25

- Approach as commented on #70. Boards draw no admin, so no canvas change.
- **Owed by hand before the first upload works**: create an R2 API token (Object Read &
  Write, bucket `hanna-vavilava-media`), set `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`,
  deploy functions, and run `npx wrangler@4 r2 bucket cors set hanna-vavilava-media --file r2.cors.json`.
  The bucket had no CORS policy at all on 2026-09-25.
- Untested end to end: no R2 S3 credentials exist in this environment. The signature is
  proven against AWS's vector, and the refusals are proven in the emulator. The real PUT,
  and R2 storing `Content-Disposition`, are checked by the first real upload. Check
  `curl -I` on the key for `content-disposition: attachment`.
- Traps: `npm test` needs `npm ci --prefix functions` in a fresh worktree, or the Functions
  emulator fails to load and the publish test fails. A preview channel's panel cannot upload,
  because its origin is not in the CORS rules.
- Rejected: deriving S3 keys from `CLOUDFLARE_TOKEN`, delete on click, and signing
  `content-length`.
