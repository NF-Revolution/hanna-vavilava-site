# E3.3 · Hero player

Shipped 2026-09-25 — see the last `## Outcome` at the bottom.

Issue [#27](https://github.com/NF-Revolution/hanna-vavilava-site/issues/27) · branch `27-e33-hero-player`

## 2026-09-25

- Blockers #26 and #12 are closed. The approach comment was posted on #27 before any code.
- Boards read: Main and MobileHome. They draw a sound toggle, but E3.2 stripped the hero's audio, so this ticket adds the audio back to the encode.
- The encode was checked with `--no-upload` on a synthetic lavfi clip. The MP4 carries h264 + aac, and the WebM carries vp9 + opus.
- Markup check: a temporary build had `hero` set and a local poster standing in for the R2 one.
  - The `<source>`s have `data-src` only, with no `autoplay` and `preload="none"`.
  - Homepage JS is about 760 B, menu included.
  - The check found `check-a11y` rejecting Astro's bare `alt` (how it renders `alt=""`), which is now fixed.
  - The temporary edits were reverted.
- No playback test in a browser: serving the files on localhost was refused by the permission classifier. iOS Low Power Mode was not tested on hardware.

## What was built — 2026-09-25

- `src/media.ts` `hero: { mp4Key, webmKey, posterKey } | null`, marked PLACEHOLDER and `null`. A file, not a `/site` database field: Hanna cannot run the encode, and either way it takes a rebuild. While it is `null`, the homepage draws the old placeholder frame.
- `HomeScreen.astro`, when `hero` is set:
  - The poster is an Astro `<Picture>` of the R2 JPEG (AVIF/WebP, eager, `fetchpriority="high"`, `alt=""`; the frame link carries the name).
  - Over it sits an invisible `<video muted loop playsinline preload="none" aria-hidden>`, with `<source data-src>` for the WebM and then the MP4.
- The inline script gate: no reduced motion, no `saveData`, and `effectiveType` is `4g` or absent. Only then does it copy `data-src` to `src` and call `load()` and `play().catch()`.
  - `playing` fades the video in and enables the sound button.
  - A click toggles `muted` and `data-on`, which swaps "Turn sound on" for the new `home.soundOff`.
- `.sound[disabled]` is `visibility: hidden`, so the horse line keeps its slot.
- `scripts/video.mjs`: the hero keeps its audio, AAC 96k and Opus 64k. It prints only the three keys, with the duration in the hint line.
- README Media covers where the hero JSON goes, and a stale `site.media` pointer now names `src/media.ts`.
- `scripts/check-a11y.mjs` accepts a bare `alt`.
- Canvas: Main and MobileHome carry a comment on the sound toggle's states (version 20).

## Outcome — 2026-09-25

- ticket-reviewer: `Verdict: clear`, with all four criteria met.
- Rejected: `autoplay` in the markup stripped by script, `poster=` (iOS Low Power Mode draws a play glyph over it), `canPlayType` picking, and a database field for the keys.
- Traps for next time:
  - Astro renders `alt=""` as a bare `alt`. Regex checks must accept it.
  - The hero keys are TS-checked. Paste only the three keys the script prints.
  - The board's note n1 still says under 2.5 MB, while E3.2's budget is 3–6 MB.
- When real footage is encoded: paste the keys into `hero`, and rewrite `home.videoAlt` in both locales. The placeholder branch and `videoSpec*` can go then.
- ponytail: one landscape rendition, cropped on portrait phones. The upgrade is a second encode behind `<source media="(orientation: portrait)">`.
