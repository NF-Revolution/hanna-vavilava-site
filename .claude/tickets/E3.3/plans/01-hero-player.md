# E3.3 · Hero player (#27)

## Context

Homepage hero is still a placeholder figure. #27 asks for the real loop: `preload="none"`, a poster, and a script that attaches the source only when reduced-motion, Save-Data and connection type allow — fetch prevented, never undone — plus iOS Low Power Mode, where muted autoplay is refused. #26 comment: this ticket decides where `{ mp4Key, webmKey, posterKey }` live. Blockers #26, #12 closed.

Boards (Main, MobileHome): full-viewport loop, whole frame links to horses, muted autoplay loop playsinline, H.264 + WebM, poster loads first, still poster under reduced-motion / Save-Data / connection < 4g. Sound toggle bottom-left, "Włącz dźwięk" / implied "Wyłącz dźwięk", hint "Tętent, oddech, drąg". No play/pause control. Mobile draws a 9:16 vertical loop.

Surprise: boards draw a sound toggle with hoofbeat copy, but E3.2's hero encode strips audio (`-an`). Toggle cannot work without an audio track.

## Approach

1. **Keys live in `src/media.ts`** as `export const hero: { mp4Key; webmKey; posterKey } | null = null; // PLACEHOLDER`. Hanna cannot run the encode script (ffmpeg + wrangler), so an admin/database field buys nothing; a rebuild is needed either way. `null` keeps today's placeholder figure — no real footage exists yet.
2. **`HomeScreen.astro`**, `hero ? player : placeholder`:
   - Poster = astro `Picture` of `media.base/posterKey` (avif/webp, eager, `fetchpriority="high"`, `sizes="100vw"`, `alt=""` — the link carries the name), `object-fit: cover`.
   - Above it `<video muted loop playsinline preload="none" aria-hidden="true">` with `<source data-src=… type="video/webm">`, then mp4. No `src`, no `autoplay` in markup, so nothing fetches. `opacity: 0` until `playing`.
   - Why an `<img>` poster, not `poster=`: in Low Power Mode iOS draws a play glyph over a video that refused autoplay; an invisible video shows nothing and the `<img>` stays. Same path covers reduced motion and no-JS.
3. **Inline `<script>`** (~0.5 KB): if not `prefers-reduced-motion`, not `connection.saveData`, and `connection.effectiveType` is `4g` or absent (Safari/Firefox) → copy `data-src` to `src`, `load()`, `play().catch(() => {})`. On `playing`: fade video in, reveal sound button. Click toggles `video.muted` and swaps label.
4. **Sound button**: `disabled` in markup, `.sound[disabled] { visibility: hidden }` (keeps edge layout, leaves tab order). Two label spans swapped by a `data-on` attribute. New key `home.soundOff`: "Wyłącz dźwięk" / "Turn sound off".
5. **`scripts/video.mjs`**: hero keeps audio — replace `-an` with AAC 96k (mp4) and Opus 64k (webm), ~100 KB. Final hint prints "paste into `hero` in src/media.ts". README Media: one line on where hero keys go; fix stale `site.media in src/site.ts` → `src/media.ts`.
6. **Artboards** (`artboards` skill): add "Wyłącz dźwięk" sound-on state to Main and MobileHome.

ponytail notes: one landscape rendition, `object-fit: cover` on portrait phones — `<source media="(orientation: portrait)">` + a second encode if the crop loses the horse. Gate read once at load, not on change.

Rejected: `autoplay` in markup stripped by script (already fetching); `canPlayType` picking (guesses; `<source type>` order lets the browser choose); hero keys in `/site` DB node (no one who can encode can't also edit a file).

## Process

- Branch: `gh issue develop 27 --base main --checkout` (in worktree e3-3).
- Post approach comment on #27 before code. Create `.claude/tickets/E3.3/` (INDEX.md, plans/01-hero-player.md, followup.md).
- Leave `home.videoAlt` rewrite for when real footage arrives (noted in outcome).

## Verification

- `npm ci`, `npm run ci` green.
- Local only, uncommitted: lavfi clip with audio → `npm run video -- clip.mp4 hero --no-upload`; point `hero`/`media.base` at files served from `public/`; `npm run build`; confirm built HTML has no `src` on `<source>`, no `autoplay`, `preload="none"`; homepage JS under 1 KB in `dist/_astro`. `npm run dev` manual check if browser available. Revert temp edits.
- Cannot test iOS Low Power on real hardware here — say so in PR.
- `ticket-reviewer` on diff, then `create-pr`, outcome comment, finalize ticket folder.
