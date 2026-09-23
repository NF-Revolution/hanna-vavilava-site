# E1.10 — followup

Shipped 2026-09-22 — see the last `## Outcome` at the bottom.

Issue [#15](https://github.com/NF-Revolution/hanna-vavilava-site/issues/15) ·
PR [#78](https://github.com/NF-Revolution/hanna-vavilava-site/pull/78) ·
branch `15-e110-accessibility-baseline` · canvas `F7qeoBwkyu2Dau5p1iLg2n` version 15

## 2026-09-22

- plan approved, built, shipped in one session. PR #78, canvas version 15.
- **board read wrong twice on `#8D8B83`.** First `artboard-reader` sweep: "not drawn".
  Second, narrower sweep: "not drawn". Truth: 10 boards — `About` `Confirmation`
  `EN-Enquiry` `EN-Horse` `Enquiry` `HorseDetail` `Horses` `HorsesGrid` `MobileHorses`
  `MobileHorsesGrid` — as `input::placeholder`, the `01`–`04` entry numbers, the "Widok"
  label. Only a per-file grep over downloaded boards got it right.
- **the boards do not draw 44px footer rows.** Canvas note `n4` says "44 px minimum
  targets on mobile"; `Footer.dc.html` draws 13px rows + 13px gap, `FooterMobile.dc.html`
  draws `min-height: 24px`. As drawn they pass WCAG 2.2 AA only through 2.5.8's spacing
  exception. First plan question was put to the user on the wrong premise ("boards already
  draw it, no artboard change"); re-asked once the read landed. Decision held: 44px
  everywhere, boards redrawn.
- **scrim needs two strengths, not one.** Worst frame is white, so composite against
  `#FFFFFF`, never `--ground-dark`. `0.62` carries `--ink-inv` at 4.79:1; `--ink-inv-muted`
  needs `0.84` (4.71:1); `--ink-inv-faint` clears nothing — 2.76:1 even at `0.84`.
  `.sound-hint` moved off faint because of this.
- **`Footer` height is never a local change.** 240→310 and 540→690 forced, for each of the
  10 boards that `<dc-import>` them: the `hint-size` attribute, the root div's `height`,
  the `$preview` height in `data-props`, and the `h` in `project/canvas.json` — then a
  re-flow of `Faq` `HorsesGrid` `EN-Horse` `EN-Enquiry` `Footer` `FooterMobile` `y` to keep
  120px between rows, and the notes row from `y: 8420` to `8500`.
- `input::placeholder` in `base.css` was `--ink-muted`, a light-ground value, and the menu
  drawer is dark ground — 2.4:1 there. Added a `[data-ground='dark']` override. No input
  renders yet; E5.1 would have inherited it.
- `scripts/check-a11y.mjs` negative-tested on all three assertion families — token pair,
  scrim floor, page structure — by breaking each once and restoring.

next: none — ticket shipped.

## What was built — 2026-09-22

### Problem

The scaffold shipped the easy half — skip link, `.visually-hidden`, `:focus-visible`,
`prefers-reduced-motion`, `--tap`, and the two tertiary greys folded into `--ink-muted` and
`--ink-inv-faint`. The ticket's four items were unbuilt, and each is a rule the next eight
epics build against: a page with no `<h1>`, a 13px target, a caption over moving video.

Measured, sRGB relative luminance:

| pair                                           | ratio   |                           |
| ---------------------------------------------- | ------- | ------------------------- |
| `--ink` `#0E0E0D` on `--ground-light`          | 17.72:1 | pass                      |
| `--ink-inv` `#F2F1ED` on `--ground-dark`       | 17.09:1 | pass                      |
| `--ink-muted` `#6B6A64` on `--ground-light`    | 4.98:1  | pass                      |
| `--ink-inv-muted` `#A3A29C` on `--ground-dark` | 7.55:1  | pass                      |
| `--ink-inv-faint` `#7D7C75` on `--ground-dark` | 4.61:1  | pass                      |
| board tertiary `#8D8B83` on light              | 3.13:1  | **fail**                  |
| board tertiary `#6E6D68` on dark               | 3.73:1  | **fail**                  |
| `--rule-field` `#C9C7C0` on light              | 1.55:1  | **fail**, SC 1.4.11 (3:1) |

Composited over a **white** video frame — the worst frame a video can show:

| α                              | `--ink-inv` | `--ink-inv-muted` | `--ink-inv-faint` |
| ------------------------------ | ----------- | ----------------- | ----------------- |
| 0.45, the entry cue as built   | 2.72        | 1.20              | 1.36              |
| 0.55, the bottom edge as built | 3.80        | 1.68              | 1.02              |
| **0.62**                       | **4.79**    | 2.11              | 1.29              |
| **0.84**                       | 10.9        | **4.71**          | 2.9               |

### Steps, in the order they were done

1. **Tokens** — `src/styles/tokens.css`. `--scrim: rgba(14,14,13,0.62)`,
   `--scrim-strong: rgba(14,14,13,0.84)`, `--rule-field: #8f8d87`. The comment block above
   them states the rule the table implies: `--ink-inv` on `--scrim`, `--ink-inv-muted` on
   `--scrim-strong`, `--ink-inv-faint` never over video. `--rule`, `--rule-hair` and
   `--rule-inv*` stay as drawn — a decorative separator is exempt from 1.4.11.
2. **Scrim** — `Header.astro` gains an `.overlay::before` gradient, solid `--scrim-strong`
   for the full height of the text and only then fading; `HomeScreen.astro` `.enter` →
   `--scrim`, `.edge` → `--scrim-strong`, `.sound-hint` off `--ink-inv-faint` onto
   `--ink-inv-muted`. `.poster-alt` and `.poster-spec*` untouched: E3.3 placeholder over
   `--placeholder-inv`, not over video.
3. **44px targets** — `.menu-trigger` 26px of bars inside a 44px box, `.head-nav .lbl`,
   `.wordmark-link`, `.foot-nav a`, `.foot-contact a`, `.foot-wordmark`, `.foot-lang-other`,
   `.menu-lang-other`, `.skip-link`. Footer columns' `gap: 13px` → `0`, so 44px rows replace
   13px rows plus a gap rather than stacking on them. Flex children blockify, so each gets
   `width: fit-content`.
4. **Tab order and structure** — `<main tabindex="-1">`, `aria-label` on all three `<nav>`
   landmarks from new `a11y.nav*` keys, `SubBar.astro`'s `<p>` → `<h1>`, a hidden `<h1>` on
   `MenuPage.astro` from `pages.menu.h1`, an explicit `aria-label` on the full-viewport
   homepage link, and `lang` + `hreflang` on both language switches.
5. **`scripts/check-a11y.mjs`**, wired into `npm run ci` after `links`. Token pairs ≥ 4.5:1,
   `--rule-field` ≥ 3:1, each scrim over white holding the inks it declares, and per built
   page: one `<h1>`, `<html lang>`, `<main id="main">`, a skip link, named `<nav>`, `alt` on
   every image, an accessible name on every icon-only `<a>`/`<button>`.
6. **Canvas**, version 15, 19 boards and the index:
   - scrim drawn on `Main`, `EN-Opening` and `MobileHome`, which drew none. Inline styles
     have no `::before`, so it is a `pointer-events: none` div before the `<header>`.
   - `#8D8B83` → `#6B6A64`, `#6E6D68` → `#7D7C75`, `#C9C7C0` → `#8F8D87` across 16 boards.
     Three exceptions went to `--rule` `#D8D6D0`: the sticky WhatsApp bar's top edge on the
     three mobile boards is a separator, not a field border.
   - `Footer` 240→310, `FooterMobile` 540→690 for the 44px rows, so the 10 boards that
     `<dc-import>` them grew by 70 and 150 — `hint-size`, root `height`, `$preview`, and the
     `h` in `project/canvas.json` — and `Faq`, `HorsesGrid`, `EN-Horse`, `EN-Enquiry`,
     `Footer`, `FooterMobile` moved to keep 120px between rows.
   - note `n4` rewritten: 44px everywhere rather than "on mobile", the corrected greys with
     their ratios, the field rule, and the scrim rule with both alphas.
7. **Record** — approach and outcome comments on #15, `.claude/tickets/INDEX.md` state and
   decisions, PR #78 via the `create-pr` skill.

### Acceptance

- `npm run ci` green, ending on `a11y`. Each assertion family negative-tested once.
- New strings in both `pl.json` and `en.json`; `astro check` enforces the shapes match.
- Keyboard-only pass on `/` and `/konie`: skip link first, focus lands in `<main>`, every
  ring visible, drawer traps focus, Escape returns to the hamburger.
- No `#8D8B83`, `#6E6D68` or `#C9C7C0` left on any board.

## Outcome — 2026-09-22

**Approach:** two scrim tokens computed against a white video frame rather than against
`--ground-dark`, plus one rule that falls out of the arithmetic — `--ink-inv-faint` never
goes over video. That framing is what made the ticket tractable: the four listed items
(contrast, scrim, 44px, tab order) each reduced to a number or an assertion instead of a
judgement call, and `scripts/check-a11y.mjs` then holds all of them for E4.x.

**Bugs met:**

- `--rule-field` `#C9C7C0` 1.55:1 on `--ground-light` → a form-input border is a UI
  component under SC 1.4.11 → `src/styles/tokens.css`, now `#8f8d87` (3.01:1). Nothing
  rendered it; E5.1 would have built the enquiry form to it.
- `input::placeholder` `--ink-muted` on the dark menu ground, 2.4:1 → one global rule for
  two grounds → `src/styles/base.css`, `[data-ground='dark']` override.
- every page behind the menu had zero `<h1>` → the sub-bar label was a `<p>` →
  `src/components/SubBar.astro:9`, now `<h1>`, `font-weight: inherit` keeps it invisible.
- the full-viewport homepage link took its accessible name from the `ALT:` placeholder
  caption inside the `<figure>` → `src/components/HomeScreen.astro`, explicit `aria-label`.

**Rejected:**

- `@media (pointer: coarse)` for the 44px targets. Note `n4` says "on mobile" and the boards
  drew 13px desktop rows, so a coarse-pointer rule was the faithful reading. Rejected by the
  owner in favour of 44px unconditionally: one rule instead of two, and it makes `n4` true
  rather than aspirational. Cost: `Footer` and `FooterMobile` had to be redrawn.
- Darkening the dark-ground greys instead of strengthening the scrim. Would have kept the
  boards' colours honest, but changes every dark-ground label across the site to fix three
  elements on one screen.
- A gradient scrim under the whole overlay header. A gradient's α varies, so text near the
  fade-out sits on less than the floor. The band is solid for the full text height first.
- axe-core in CI. A headless browser and a dependency tree for a static site that ships under
  1 KB of JavaScript. Named as the upgrade if the regex check stops being enough.
- A scrim behind `.poster-alt`. It is the E3.3 placeholder caption and dies with it.

**Traps for next time:**

- `--ink-inv-faint` `#7D7C75` passes 4.61:1 on `--ground-dark`, so it reads as safe. It
  clears no scrim over video — 2.76:1 at `--scrim-strong`. Dark _page_, yes; homepage, never.
- an `artboard-reader` summary is not authoritative for "does hex X appear anywhere on the
  canvas". It answered "not drawn" twice about a hex in 10 boards. For a sweep, have the
  agent download every board with `out_dir` and grep the saved files; keep the summary for
  "what does this screen look like".
- canvas note `n4` and the per-element drawing contradict each other on target size. When
  they disagree, say so to the owner before asking which to follow — the cost of the answer
  changes completely depending on which one is true.
- changing a `<dc-import>`ed board's height is four edits per importer plus a canvas
  re-flow. Check `grep -n 'dc-import' project/*.dc.html` before agreeing to it.

**Files that mattered:** `src/styles/tokens.css`, `src/components/HomeScreen.astro`,
`src/components/Header.astro`, `scripts/check-a11y.mjs`, `.claude/tickets/INDEX.md`.
