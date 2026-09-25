# E3.4 · Sales video facade

Shipped 2026-09-25 — see the last `## Outcome` at the bottom.

Issue [#28](https://github.com/NF-Revolution/hanna-vavilava-site/issues/28) · branch `28-e34-sales-video-facade`

## 2026-09-25

- No `**Blocked by**` on #28; #26 (encode script) merged.
- Boards read (HorseDetail, MobileDetail): custom 58/40px play glyph + "Odtwórz", poster 640/200 (round 480/200), transcript drawn as a PL · EN link line, no disclosure.
- User chose: native `<video controls preload="none">`, zero JS (JS budget), and both transcripts as two `<details>`.

- #28 body rewritten (native player, both transcripts, checklist added — it had none). Approach comment posted; heading-row note on #35.
- `Video.astro` + `video.*` i18n built. Stand-in (MDN sample poster + mp4 via `media.base`, scratch page, headless Chrome over CDP, reverted):
  - 0 MP4 requests before play, 1 after; poster WebP from `dist/`; no `<script>`.
  - Box 1440×640 / 480 steady across play. At 390 the stand-in's square poster vs 16:9 clip resized the box after play — stand-in artefact; the real poster is cut from the clip.
  - `summary { display: flex }` dropped the disclosure marker and the space before the `<span>`; fixed to `list-item` + padding.
- `npm run ci` green. INDEX row + decision line added.
- Canvas v21: HorseDetail/MobileDetail — native control bar instead of the glyph, two stacked `<details>`; boards grew 67/63 px (6997, 5743), index resized.

- ticket-reviewer: `Verdict: clear`, all four criteria met.

next: none — shipped.

## What was built — 2026-09-25

**Problem.** The sales video and the uncut round need a facade: no media bytes, no third-party request and no cookie before play. They need a real poster with a fixed size and the transcript as indexable text. The boards (HorseDetail, MobileDetail) drew a custom 58/40 px play glyph with "Odtwórz", poster boxes of 640/200 px (the round 480/200), and a "Transkrypcja komentarza: polski · english" link line.

**Steps.**

1. `src/components/Video.astro` takes one `videos[]` entry and `locale`. It is not mounted: E4.5 (#35) places it, with the heading row.
2. The player is a native `<video controls preload="none" playsinline>` with an MP4 `<source>` on `media.base`.
3. `poster` is a `getImage` WebP no wider than 1280 px, built into `dist/` from the R2 frame. `width`/`height` are the frame's own size, from `inferRemoteSize`.
4. CSS: `width: 100%`, `height: auto`, `max-height` 640 px (480 px for `data-kind=round`), `object-fit: contain`, background `--placeholder`.
5. The accessible name is `video.label`, "Film sprzedażowy — 1 minuta 48 sekund", with the minute and second forms going through `plural()`.
6. There are two `<details>`, the page's language first. The summary is `video.transcript · <span lang>` plus the other dictionary's `lang.current`. The body is `<div lang>` with one `<p>` per blank-line paragraph. An empty transcript is skipped.
7. i18n: `video.{sales, round, label, minutes, seconds, transcript}` in both locales.
8. `.claude/tickets/INDEX.md` gets a state row and a decision line.
9. Canvas v21: both detail boards draw a native control bar instead of the glyph, and two stacked disclosures. The boards grew to 6997 and 5743 px.
10. #28's body was rewritten to the native approach, with a checklist added, since it had none.

**Acceptance.** No media or third-party request before play, and no script · the poster is the encode frame, with width and height · both transcripts in disclosures, omitted when empty · ready for E4.5, and the boards match. All met.

## Outcome — 2026-09-25

**Approach.** The browser's own player is the facade. `preload="none"` fetches nothing but the poster, and the player works with JS off. The component ships zero bytes of script.

**Bugs met.** `summary { display: flex }` drops the disclosure marker and collapses the space before the language `<span>`. The summary stays `list-item`, with padding for the 44 px target.

**Rejected.**

- A scripted poster button that swaps in `<video autoplay>`, the body's original wording. It costs about 250 B, and next to the drawer (364 B) and the gallery (~600 B) that breaks 1 KB.
- An overlay glyph over the native video: it doubles the browser's own play button, and hiding it needs script.
- `white-space: pre-line` for the paragraphs: prettier reflows the `{text}` onto its own line, and the leading newline then renders.
- `Intl.DurationFormat`: Node 22 lacks it.

**Traps for next time.**

- `poster=` is eager and has no srcset. Each mounted video costs one WebP at page load (`ponytail:` in the component).
- The box keeps the poster's ratio only until metadata loads, and then takes the clip's own ratio. That is safe only because the encode cuts the poster from the clip. A hand-made poster in another ratio would shift the box on play.
- There is no `<track>` for captions (`ponytail:`).
- The board's meta line, "nagrane … · bez podkładu muzycznego", has no schema fields. That is noted on #35.
- A canvas publish may be refused as stale right after a `read` with `paths`. It went through after a plain `read` and a `list` with `scope: "files"`.

**Files that mattered.** `src/components/Video.astro`, `src/components/HomeScreen.astro` (the poster sizing pattern), `src/i18n/format.ts`, `scripts/video.mjs`.
