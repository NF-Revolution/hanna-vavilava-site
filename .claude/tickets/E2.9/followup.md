# E2.9 · Seed the four real horses

Shipped 2026-09-25 — see the last `## Outcome` at the bottom.

Issue [#24](https://github.com/NF-Revolution/hanna-vavilava-site/issues/24) · follow-up [#91](https://github.com/NF-Revolution/hanna-vavilava-site/issues/91) ·
branch `24-e29-seed-the-four-real-horses`

## 2026-09-25 — two horses with invented facts

- The user supplied photos only, for Red Bull and Lotus Blue, and asked for random data for now. **Every fact on both horses is invented except the name, the colour and the photos**: pedigree, price, X-rays, starts, health. Replace them before either horse is published for real.
- Photos were re-encoded with `sips` at their native 1280 px long edge. Telegram had already stripped EXIF, and there is no GPS in the files. Note that `sips -Z 2400` upscales, unlike `fit()`.
- The seed is a one-off script outside the repo that uploads the photos to Storage and writes `horses/<slug>` (order 1 and 2). It needs gcloud ADC, so the user runs it. It does not Publish.
- The user ran `seed.mjs --write`. All 5 photo URLs return 200. `/horses` can only be read by an admin, so check the DB nodes in `/admin`. Not published.
- Open for this ticket: two more horses, the Cascada delete, and a check of every page against a prod build.

## 2026-09-25 — approach

- The work is content entry, not code. The admin covers every `horseSchema` field (`src/horse.ts`).
- The issue body was stale about `src/site.ts`. The invented horses live in `src/fixture.json`, which is CI build data, and they stay there. AC corrected.
- Only `horses/cascada` is in production. It gets deleted once in the Firebase console.
- Videos wait on #26. `home.videoAlt` naming Cascada was noted there.
- Next: the user enters the horses. Then build against production, check every page, tick the AC, and open a notes-only pull request.

## Per-horse checklist (in `/admin`)

For each of the four horses:

1. **Identity**: slug (the URL, lower-case, never changed later), name, sex, born, height in cm, breed (studbook code), pedigree.
2. **Sale**: `levelCm`; `price` in whole EUR, or empty for "on request" (#2); `seller` `company` or `private` (#3).
3. **Text, PL and EN**: headline, every `facts` row, `suits` / `notFor`, `health` (vaccinations, dewormed date, known issues), `viewing` (lead, airport, visit day).
4. **X-rays** (#4): count, exam date and scope in PL and EN. `xrays.files` only where a PDF exists and the owner agrees. It is JSON `[{ "key": "<r2 key>", "bytes": n }]`, and the PDF must already be in R2. Otherwise leave it `[]`. With no study at all, leave the whole section empty.
5. **Photos**: upload them. The first is the cover. Alt text is required in PL and EN; the caption is optional.
6. **Videos**: leave `[]` until #26 produces the keys.
7. **Status and order**, then Save.

Once all four are saved:

8. In the Firebase console, open Realtime Database → `horses`, and delete `cascada`. Check that no other invented slug is there.
9. In `/admin`, press **Publish**.

## What was built — 2026-09-25

- No site code. The admin (E2.4–E2.8) already covers every `horseSchema` field.
- Issue body corrected. The invented horses were never in `src/site.ts`. They live in `src/fixture.json` as CI build data and they stay there.
- A one-off seed script outside the repo uploaded 5 photos to Storage and wrote `horses/red-bull` (order 1) and `horses/lotus-blue` (order 2). It validated both horses against `horseSchema` first and ran on gcloud ADC.
- The per-horse checklist above is the entry guide for #91.

## Outcome — 2026-09-25

- **Scoped down by the user**: two horses instead of four, with invented facts and real photos, and not published. #91 carries the real facts, the other two horses, the `horses/cascada` delete and the Publish.
- **Trap: invented data sits in production.** Pressing Publish before #91 puts invented pedigrees, prices and X-ray details on the live site.
- **Trap: `sips -Z 2400` upscales** a 1280 px photo, which `fit()` never does. Re-encode without `-Z`.
- **Trap: the auto-mode classifier blocks any script that can write to production**, even a dry run of it. The user runs the seed with `!`.
- `home.videoAlt` still names Cascada. A note is on #26.
- Rejected: an admin delete button for horses. It is one console click today.
