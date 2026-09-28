# E5.1 (#40) rework — WhatsApp only, optional Instagram

## Context

PR #121 (open, not merged) ships eight fields. Owner decision: the contact field becomes
WhatsApp only (drop Telegram from the label), and an optional Instagram field is added.
Nine fields now, so ticket body ("Eight fields") is stale — fix it first. #42 not built
yet, so field names can still change freely.

## Decisions (defaults, say if wrong)

- Field renamed `messenger` → `whatsapp`. Same `type="tel"`, same `+` pattern, same
  placeholder `+48 000 000 000`. Label "WhatsApp" in both languages.
- New `instagram`: `type="text"`, optional, maxlength 100, `autocomplete="off"`,
  placeholder `@`. **No pattern** — a buyer pasting `instagram.com/x` must not be blocked on
  the money path; #42 normalises. Label "Instagram — opcjonalnie" / "Instagram — optional".
- Order: name, country / whatsapp, instagram / level, budget / timeframe, horse / note —
  `note` spans both columns on desktop (`grid-column: 1 / -1`), so the grid stays even.

## Steps

1. **Ticket first.** Edit #40 body: nine fields, WhatsApp number needs leading `+`,
   optional Instagram. One comment on #40 recording the owner's decision and why the body
   changed. Edit the E5.1 contract comment on #42 (`gh api -X PATCH
repos/.../issues/comments/5870916452`): `whatsapp` replaces `messenger`, `instagram`
   optional free text ≤100.
2. **Reopen notes**: `.claude/tickets/E5.1/followup.md` status → `Reopened 2026-09-28`,
   new `INDEX.md` + `plans/01-whatsapp-instagram.md` (this plan).
3. **Code** (`src/components/EnquiryForm.astro`, `src/i18n/pl.json`, `src/i18n/en.json`):
   - strings: `messenger*` → `whatsapp`, `whatsappPlaceholder`, `whatsappFormat`; existing
     link string `whatsapp` → `orWhatsapp`; add `instagram`, `instagramPlaceholder`.
   - add instagram `<label class="fld">` after whatsapp; `note` field gets class `wide`.
   - mobile unchanged (single column already).
4. **Artboards** (canvas `F7qeoBwkyu2Dau5p1iLg2n`), plain read first, one publish:
   `Enquiry`, `EN-Enquiry`, `MobileEnquiry`, `HorseDetail` (draws the same form for #41).
   Label → WhatsApp, `name="whatsapp"`, Instagram field added, note full width. Each gains
   one row (~105px desktop, ~91px mobile): update root height + `$preview` + `canvas.json`
   `h`, and nudge any board below that would sit closer than 120px (`HorseDetailSold` under
   `Enquiry`, `Footer` under `EN-Enquiry`) — re-read `canvas.json` right before publish.
5. `npm run ci`, `ticket-reviewer` on the branch diff, fix real findings.
6. Finalize notes again (new `## What was built` / `## Outcome` pair at bottom, delete
   `INDEX.md` + `plans/`), commit `feat: whatsapp-only contact and optional instagram
field`, push, update PR #121 body (nine fields, boards changed), outcome comment on #40.

## Verification

- `npm run ci` green; built `dist/zapytanie/index.html` has `name="whatsapp"` with the
  pattern, `name="instagram"` without `required`, no new `<script>`.
- Pattern still: `+48 600 100 200` passes, `600100200` fails.
- Preview channel on PR #121: 1440 grid ends with full-width note; 390 single column.
