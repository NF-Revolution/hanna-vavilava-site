# E2.9 · Seed the four real horses

In progress — waiting on Hanna's data entry in `/admin`.

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
