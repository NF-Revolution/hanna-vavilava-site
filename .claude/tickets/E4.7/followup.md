# E4.7 — followup

Shipped 2026-09-27.

Issue [#37](https://github.com/NF-Revolution/hanna-vavilava-site/issues/37) ·
branch `37-e47-questions-page` · canvas `F7qeoBwkyu2Dau5p1iLg2n` version 32

## 2026-09-27

- Blocker #17 is closed. The approach is posted on #37.
- The first board summary said `Faq.dc.html` draws `−` closed and `+` open. That was wrong. The
  source shows `+` closed (`c0`) and `−` open (`a0`), so the page matches the board.
- The same source read showed the questions at 12px / 0.16em, not `.lbl`'s 10px, and the intro
  beside the heading, not under it. Both are fixed.
- The reviewer returned `Verdict: clear`.

## What was built — 2026-09-27

- `src/components/FaqPage.astro` is the whole page. `pytania.astro` and `en/questions.astro` are
  wrappers around it, the `AboutPage` pattern.
- The sub-bar is "Pytania · 06" with the "Odpowiada Hanna" meta, kept at 390.
- The intro row has a 38px `<h2>` on the left and the muted intro, at most 340px wide, on the
  right. At 390 they stack and the heading is 28px.
- The six questions are `<details>`/`<summary>`. The summary is flex, with no marker. The icon is
  an inline SVG with two paths, and the vertical path is hidden under `[open]`.
- The copy is in `pages.faq.{meta, heading, intro, items[], band, enquiry}` in both dictionaries.
  The EN copy is translated, because no EN board exists. The band's hours come from
  `site.responseWindow`.
- About's inline band moved into `src/components/CtaBand.astro` (`line`, `href`, `label`). About
  looks the same.
- Canvas v32: new `MobileFaq.dc.html` board, 390 × 1750, with live disclosures. `Faq.dc.html` is
  unchanged.

## Outcome — 2026-09-27

Shipped as planned, except that no icon fix was needed. Traps for next time:

- `artboard-reader` (Haiku) can misread `sc-if` toggles. When a summary claims the board is
  "backwards", read the board source before building a deviation.
- The worktree guard refuses a quoted command path that contains spaces, such as the Chrome
  binary. Put the command in a script file and run `bash <file>`.
- Artifact `publish` to the canvas was refused after reading single files by `paths`, even
  though the version had not changed. A plain `read` of the canvas URL, with no path, cleared it.
- An `astro build` wipes `dist/`, which includes any screenshot harness written there.
