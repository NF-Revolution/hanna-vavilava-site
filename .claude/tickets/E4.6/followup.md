# E4.6 — followup

Shipped 2026-09-26.

Issue [#36](https://github.com/NF-Revolution/hanna-vavilava-site/issues/36) ·
branch `36-e46-about-page` · canvas `F7qeoBwkyu2Dau5p1iLg2n` version 30

## 2026-09-26

- Blocker #17 closed. Approach posted on #36.
- The owner supplied a 1080×1440 portrait and asked for portrait framing, not the board's
  1440×620 band. The first photo they sent was 640×640, which was too small. The photo carries no
  EXIF or GPS block.
- The reviewer found that the fixed 480px portrait squeezed the bio to 128px at 768. The column
  is now `min(480px, 40%)` in a grid.
- The owner signed off the screenshots at 1440, 800 and 390 before the push.

## What was built — 2026-09-26

- `src/components/AboutPage.astro` is the whole page. `o-mnie.astro` and `en/about.astro` are
  wrappers around it, the `MenuPage` pattern.
- The sub-bar is "O mnie" plus the meta line; the meta is hidden at 390.
- The intro is a grid, `min(480px, 40%) | 1fr` with an 80px gap. The portrait is
  `src/assets/about/hanna.jpg` through `<Picture>` (avif and webp, jpg fallback, widths
  480/960/1080, eager, fetchpriority high). The bio is 17/1.7 with the Italianno signature, 56px,
  below it. At 390 the grid has one column.
- The five steps are an `<ol>`. Step 1's hours come from `site.responseWindow`.
- The dark band shows `plural(pages.about.band, site.horsesAvailable)` and the reply line, a
  solid WhatsApp link and an outline link to the horses. It stays inline (`ponytail:`) until
  E4.7 or E4.8 draw the same band.
- The copy is in `pages.about` in both dictionaries. The EN copy is translated; no EN board exists.
- Canvas: `About.dc.html` has the portrait beside the bio, height 2073. `MobileAbout.dc.html` is
  new, 390 × 2708.

## Outcome — 2026-09-26

Shipped as planned, plus the reviewer's grid fix. Traps for next time:

- Headless Chrome cannot render narrower than about 500px, so a `--window-size=390,…` screenshot
  shows the page at 500 cropped. Screenshot a 390px `<iframe>` instead.
- In Astro, two `{expr}` on separate lines render with no space between them. Join them in one
  template string.
- The board's ALT text described a photo that does not exist. Write the ALT from the real photo.
- The worktree guard rejects shell lines that mix `git` with variables or heredocs. Call
  `/usr/bin/git -C <worktree>` on its own line.
