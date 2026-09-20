# Ticket map

Tickets live in GitHub Issues: <https://github.com/NF-Revolution/hanna-vavilava-site/issues>
One milestone per epic (E0–E8), one `epic:*` label per issue, blockers linked as `#N`.

Full plan: `~/.claude/plans/i-have-a-design-fancy-church.md`
Design: Artifact canvas `F7qeoBwkyu2Dau5p1iLg2n` ("Hanna Vavilava — sales site")

## State

| Ticket                       | Issue              | State                                            |
| ---------------------------- | ------------------ | ------------------------------------------------ |
| E1.1 repo, Astro, TS, CI     | #6                 | done                                             |
| E1.5 design tokens           | #10                | done                                             |
| E1.6 self-hosted fonts       | #11                | done                                             |
| E1.7 base layout             | #12                | done                                             |
| E1.8 shared footer           | #13                | done                                             |
| E1.9 menu drawer             | #14                | done                                             |
| E7.1 localised routing       | #57                | done                                             |
| E1.3 Actions deploy          | #8                 | written, unverified — needs the Firebase project |
| E1.4 preview channel         | #9                 | written, unverified — needs the Firebase project |
| E1.10 accessibility baseline | #15                | partial                                          |
| everything else              | see the milestones | not started                                      |

## Decisions made along the way

- Astro 7.3.3, not 5 — that is what `npm create astro` installs now.
- Realtime Database, not Firestore (owner's call). Content is read once at build
  time, so Firestore's per-document read model bought nothing, and one JSON tree
  priced on bandwidth is the predictable number. Paths: `/horses`, `/enquiries`,
  `/subscribers`, `/site`.
- Tertiary greys deviate from the artboards: `#8D8B83` (3.13:1) and `#6E6D68`
  (3.74:1) fail WCAG AA at 10–11px, so they are folded into `--ink-muted` and
  `--ink-inv-faint`. Needs the designer's sign-off (E1.10).
- The grid view is a second static route, not a JS toggle — shareable,
  crawlable, and less code (E4.3).
- The homepage scrim behind the entry cue and bottom edge is an addition: text
  over moving video has no guaranteed contrast.
- The artboards have no sold-horse state. Raised in E2.8.
