# E7.8 — followup

Shipped 2026-10-05 — see the last `## Outcome` at the bottom.

Issue [#152](https://github.com/NF-Revolution/hanna-vavilava-site/issues/152) ·
branch `152-e78-remove-every-mention-of-russian` · canvas `F7qeoBwkyu2Dau5p1iLg2n` version 57

## 2026-10-05

- plan approved, built and shipped in one session.
- dictionaries had drifted: the `pl.json` footer already said "Polski · English", but the
  `en.json` footer still listed Русский. The boards had drifted the other way: both footer
  boards still drew Русский on the Polish footer.

## What was built — 2026-10-05

- `src/i18n/en.json`: `footer.languages` is now "Polski · English". The bio's last sentence is
  now "I speak Polish and English, and I answer myself, with no intermediary."
- `src/i18n/pl.json`: the bio's last sentence is now "Rozmawiam po polsku i angielsku, i odpowiadam
  sama, bez pośrednika."
- Canvas version 57 changes the same copy on four boards: `Footer`, `FooterMobile`, `About` and
  `MobileAbout`. It was a copy change only, so `canvas.json` was not sent. No English About board
  exists.

## Outcome — 2026-10-05

- `grep -riE "russian|rosyjsk|русск" src` returns nothing, and `npm run ci` passes.
- Left alone on purpose: `scripts/fonts.mjs:5` still says "Adding Russian means adding
  'cyrillic'…". It is a tooling note, not site copy, and the font subsets carry no Cyrillic.
- Trap: the Artifact publish `root` must be under the working directory or the scratchpad.
  `$CLAUDE_JOB_DIR/tmp` is neither, so stage the boards in a throwaway folder inside the
  worktree and delete it after the publish.
