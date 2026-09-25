# E3.2 · Video encode recipe

Shipped 2026-09-25 — see the last `## Outcome` at the bottom.

Issue [#26](https://github.com/NF-Revolution/hanna-vavilava-site/issues/26) · branch `26-e32-video-encode-recipe`

## 2026-09-25

- Blocker #69 is closed. The approach comment was posted on #26 before any code.
- No artboard read: nothing a visitor sees changes.
- Verified on synthetic lavfi clips with `--no-upload`:
  - a 1080p landscape clip with audio, used for both the hero and a round clip
  - a 1080x1920 portrait clip
  - a 4K60 HEVC clip
  - a 10-bit HLG HEVC clip
- Upload verified on the live bucket: `horses/e32-upload-test/videos/sales-6902fe9f.mp4` and `.jpg` were served `200` with the right type and the immutable `cache-control`. They are throwaway test objects, deleted by hand.

## What was built — 2026-09-25

- `scripts/video.mjs`, run as `npm run video -- <input> hero | <input> sales|round <slug>`, with `--poster <s>` and `--no-upload`.
  - It uses only Node's standard library, plus ffmpeg, ffprobe and `npx wrangler@4`.
  - The bucket and the `Cache-Control` value are imported from `src/media.ts`, which Node's type stripping allows.
- Every output is H.264 High `yuv420p` with `+faststart`, and the short side is capped at 1080 so portrait footage scales too.
  - Clips: CRF 23 with AAC 128k, one rendition. That ceiling is marked `ponytail:`, with Cloudflare Stream as the upgrade.
  - Hero: CRF 21 capped at 5 Mbps, no audio, plus a VP9 WebM.
- The poster is a JPEG cut at `--poster` seconds. The default is 0 for the hero, so the poster matches the loop's first frame, and 1 s for clips.
- `durationS` is read from the encoded MP4 and rounded, with a floor of 1.
- Keys are content-addressed with the sha256 of each file:
  - clips: `horses/<slug>/videos/<kind>-<sha8>.mp4|.jpg`
  - hero: `home/hero-<sha8>.mp4|.webm|.jpg`
- Output:
  - For a clip, one `videos[]` entry to paste into the admin, with an empty transcript to fill in.
  - For the hero, `{ mp4Key, webmKey, posterKey, durationS }` for E3.3.
- The README Media section now covers the script. The `horse-form.ts` ponytail comment now points at the script. `.claude/tickets/INDEX.md` records the budget decision.

## Outcome — 2026-09-25

- ticket-reviewer: `Verdict: clear`, with every criterion met.
- Traps for next time:
  - A lavfi clip tagged with `-color_trc` on an H.264 encode does not carry the tag. To test HDR refusal, encode with `libx265 -x265-params transfer=arib-std-b67`.
  - A 6 Mbps cap with a 12M buffer overshot to 6.4 MB on noisy footage, so the cap is 5M with a 10M buffer.
  - The VP9 WebM is not byte-deterministic, so re-running the script gives a new key. That is harmless, because keys are never overwritten.
- Carried to E3.3: rewrite `home.videoAlt` once real hero footage is encoded.
- `npm run ci` on `main` failed Prettier on a stray indent in `.claude/skills/ticket-implement/SKILL.md`, so this branch fixes that indent too.
