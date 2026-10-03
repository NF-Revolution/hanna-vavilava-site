# E5.12 — followup

Shipped 2026-10-03. See the last `## Outcome` at the bottom.

Issue [#151](https://github.com/NF-Revolution/hanna-vavilava-site/issues/151) ·
branch `151-e512-simpler-next-steps-on-the-confirmation-page`

## 2026-10-03

- No blockers. The approach comment is posted on #151.
- The scope widened in planning. The owner wants the twenty-minute video call and the
  "material after the call" promise gone everywhere, not only on the sent page. The issue body
  and title were rewritten to match before any code was written.
- The ticket's "homepage line" (`home…text`, pl.json line 246) is About's buying step 2.
  The homepage itself never mentions the call.
- `npm run ci` is green. The built sent pages have two `.step` items each, and the CSS is
  `repeat(2, minmax(0, 1fr))` with the existing one-column rule under 720px.
- Headless Chrome screenshots were refused by the worktree guard, so the layout is checked
  from the built CSS only.
- `ticket-reviewer`: `Verdict: clear`. Its note about `worktree-clean/SKILL.md` in the diff
  came from a stale local `main`. The diff against `origin/main` has four files.

## What was built — 2026-10-03

- Sent-page step 2 (`pages.enquirySent.steps[1]`): PL "Rozmowa i spotkanie" — "Umówimy
  rozmowę telefoniczną i spotkanie w stajni."; EN "A call and a visit" — "We can arrange a
  phone call and a meeting at the stable." Step 3 is deleted in both dictionaries.
- `EnquiryDone.astro`: `.steps` goes from `repeat(3, …)` to `repeat(2, …)`. A hardcoded 2,
  because the list is fixed copy. Columns derived from the count would need a mobile override.
- About step 2 (`pages.about.steps[1]`): PL "Rozmowa telefoniczna" — "Umówimy rozmowę o
  Państwa poziomie i celach."; EN "A phone call" — "We arrange a call about your level and
  your goals." Step 3 "Oglądanie" is already the visit, so About keeps five steps.
- `pages.about.description` and the remote-buying FAQ answer: "video call" becomes "phone
  call", and "rozmowa wideo" becomes "rozmowa telefoniczna".
- Canvas v53 has six boards changed: `Confirmation` (two steps, `repeat(2, …)`),
  `MobileConfirmation` (two steps), `About` and `MobileAbout` (step 2), and `Faq` and
  `MobileFaq` (the remote-buying answer). It is copy only. No board was resized, and
  `canvas.json` was not sent.

## Outcome — 2026-10-03

- The phone call is now the only call promised anywhere on the site.
- Lines left deliberately: "Full uncut footage on request", "Full round, no cuts", the
  trial-period answer's "full uncut recordings", and the X-ray strings. They describe the
  product, not a step after the call.
- Trap: the Artifact tool refuses a publish `root` under `$CLAUDE_JOB_DIR`. Stage the edited
  boards in a folder under the worktree, publish, then delete the folder.
- Trap: the worktree guard refuses any command whose binary path is quoted or has spaces,
  Chrome included. Screenshots need a session outside the guard.
