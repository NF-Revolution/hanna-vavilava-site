# Ticket map

Full plan: `~/.claude/plans/i-have-a-design-fancy-church.md`
Design: Artifact canvas `F7qeoBwkyu2Dau5p1iLg2n` ("Hanna Vavilava — sales site")

| Ticket                  | State               | Notes                                                                             |
| ----------------------- | ------------------- | --------------------------------------------------------------------------------- |
| 1.1 repo, Astro, TS, CI | done                | `npm run ci` = format, types, build, link check                                   |
| 1.2 Firebase project    | blocked             | needs the owner's Google account + Blaze                                          |
| 1.3 Actions deploy      | written, unverified | needs 1.2 for the service account                                                 |
| 1.4 preview channel     | written, unverified | needs 1.2                                                                         |
| 1.5 design tokens       | done                | `src/styles/tokens.css`                                                           |
| 1.6 self-hosted fonts   | done                | `npm run fonts` regenerates; Archivo is variable, one file per subset             |
| 1.7 base layout         | done                | `src/layouts/Base.astro`, dvh + skip link                                         |
| 1.8 footer              | done                | one responsive component, not a desktop/mobile pair                               |
| 1.9 menu drawer         | done                | `<dialog>`; `/menu` is the no-JS fallback                                         |
| 1.10 a11y baseline      | partial             | tertiary greys corrected in tokens.css; scrim on the homepage; audit still to run |
| 7.1 i18n routing        | done                | `src/i18n/routes.ts` drives links, the switch and hreflang                        |
| everything else         | not started         | see the plan                                                                      |

## Decisions made along the way

- Astro 7.3.3, not 5 — that is what `npm create astro` installs now.
- Tertiary greys deviate from the artboards: `#8D8B83` (3.13:1) and `#6E6D68`
  (3.74:1) fail WCAG AA at 10–11px, so they are folded into `--ink-muted` and
  `--ink-inv-faint`. Raise with the designer.
- The grid view is a second static route, not a JS toggle — shareable and
  crawlable, and less code.
- The homepage scrim behind the entry cue and bottom edge is an addition: text
  over moving video has no guaranteed contrast.
