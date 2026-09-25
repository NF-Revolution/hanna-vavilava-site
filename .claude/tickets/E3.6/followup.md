# E3.6 — followup

Shipped 2026-09-25 — see the last `## Outcome` at the bottom.

Issue [#30](https://github.com/NF-Revolution/hanna-vavilava-site/issues/30) ·
branch `30-e36-photo-intake-guide`

## 2026-09-25

- Blocker #20 closed. Owner chose a static admin page with Polish prose inline.
- Approach posted on #30. Page written, panel legends link to it, `npm run ci` green.
- Reviewer found one high: the links opened in the same tab and threw away unsaved
  editor state, including orphaned R2 uploads. Fixed with `target="_blank"`.

## What was built — 2026-09-25

- `src/pages/admin/poradnik.astro` at `/admin/poradnik`. It is standalone like `/admin`: `noindex`,
  no script, no sign-in, and out of `routes.ts`. Its sections cover the six shots from the board
  gallery list (the first is the cover), the crop rule, how to send photos, HEIC, and the X-rays.
  The crop rule: shoot landscape with the whole horse centred and margin on every side, because
  one file is cut to 1440×900, 390×844, 437×560 and 190×190. Sending: upload in the panel, never
  as a WhatsApp photo, and as a WhatsApp "Dokument" only when nothing else is at hand. The
  X-ray section covers the PDF under the limit, the owner-free page 1 from the clinic, the vet's
  name staying, and the count, date and scope.
- `MAX_EDGE` (`src/photo.ts`) and `xrayMaxBytes` (`src/media.ts`) are imported, not typed.
- The panel's photo and X-ray legends link to it in a new tab through `admin.guideLink` in both
  locale files.
- `.claude/tickets/INDEX.md`: state row and decision.

## Outcome — 2026-09-25

The guide shipped as planned. Rejected: a Claude Doc (drifts from the code limits), a docs/ markdown
file (not readable on a phone), prose in both JSON files, and a PWA manifest.

Traps for next time:

- Any link out of the open horse editor must open a new tab. The panel has no
  `beforeunload` guard, and a same-tab navigation loses the form and orphans R2 uploads.
- Drawn boxes do not redact PDFs. The guide sends Hanna to the clinic for page 1.
- The HEIC claim ("Safari only") rests on `photo.ts`'s own comment. Revisit it if a WASM decoder lands.
