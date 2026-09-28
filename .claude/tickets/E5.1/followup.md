# E5.1 — followup

Shipped 2026-09-28 — see the last `## Outcome` at the bottom.

Issue [#40](https://github.com/NF-Revolution/hanna-vavilava-site/issues/40) ·
PR [#121](https://github.com/NF-Revolution/hanna-vavilava-site/pull/121) ·
branch `40-e51-enquiry-form-markup` · canvas `F7qeoBwkyu2Dau5p1iLg2n` version 36

## 2026-09-28

- plan 01 approved. Blockers clear (#12 closed).
- **`artboard-reader` misquoted the PL heading** as "Piszą Państwie"; the board says
  "Piszą Państwo bezpośrednio do Hanny." Exact copy came from downloading
  `project/Enquiry.dc.html` / `project/EN-Enquiry.dc.html` with `Artifact read` + `paths`.
- `Enquiry.dc.html` also draws the lighter "Szukają Państwo czegoś innego?" form — that is
  E5.2 (#41), not built here.
- EN board draws field borders `#0E0E0D`, PL board `#8F8D87`; built to `--rule-field` (PL).
- No 390 enquiry board existed (`MobileDetail` moves the form into the bottom bar). Drew
  `MobileEnquiry.dc.html` (390 × 1940, x 11830) to match the built layout.
- `ticket-reviewer`: clear.

## What was built — 2026-09-28

- `src/components/EnquiryForm.astro` — the `<form method="post" action="/api/enquiry">`,
  reusable by #41. Fields `name`, `country`, `messenger`, `level`, `budget`, `timeframe`,
  `horse`, `note`; all required except `note`. `messenger` is `type="tel"` with
  `pattern="\+\d[\d\s\-]{5,}\d"` and a `title` asking for the country code.
- Select values are codes: `level` `junior|amateur110|amateur125|pro`, `budget`
  `15-20|20-30|30-40|40plus`, `timeframe` `month|quarter|season|browsing`, `horse` a slug
  from `site.horsesListed` or `undecided`. Each select opens on a blank option.
- `src/components/EnquiryPage.astro` — sub-bar meta, heading, lead, form. Both locale pages
  are one line.
- Strings: `enquiryForm` and `pages.enquiry.{meta,heading,lead}` in both dictionaries;
  hours from `site.responseWindow`.

## Outcome — 2026-09-28

- Approach held. No JavaScript added; `npm run ci` green.
- **Trap for #42:** `/api/enquiry` has no Hosting rewrite yet. Adding one before
  `submitEnquiry` exists fails the deploy, so #42 adds both together. Until then a submit
  on the live site gets a Hosting 404/405.
- **Trap for #42:** honeypot, time trap and locale hidden field are not in the form; #42
  adds them with the code that reads them. The zod enums must use the codes above.
- The pattern is checked by the browser in `v` mode: inside a class, `-` must be escaped.
- Admin inbox still shows raw keys (E2.7); Polish labels for these eight fields are open.
- Canvas scratch root must be under the working directory — `$CLAUDE_JOB_DIR/tmp` is
  refused as a publish `root`. Used a throwaway `.canvas-tmp/` and deleted it.

## What was built — 2026-09-28 (reopen: WhatsApp only, optional Instagram)

- Owner decision on #40: the contact field is WhatsApp only, and a ninth field, Instagram,
  is optional. The #40 body was edited to nine fields before building, and the #42
  contract comment was edited in place.
- `messenger` → `whatsapp` (same `+` pattern). New `instagram`: text, ≤100, no pattern,
  `autocomplete="off"`, placeholder `@`. `note` spans the whole last row (`.wide`).
- Strings: `enquiryForm.messenger*` → `whatsapp*`; the old link key `whatsapp` →
  `orWhatsapp`; added `instagram`, `instagramPlaceholder`.
- Canvas v36: `Enquiry`, `EN-Enquiry`, `MobileEnquiry`, `HorseDetail` redrawn. Each board
  gained a row (heights 1770 / 870 / 2030 / 7215). Moved `HorseDetailSold` y→3290,
  `Footer` y→4300, `FooterMobile` y→4730, and the six bottom stickies y→8740.
  `HorseDetail` was already 13px over them before this change.

## Outcome — 2026-09-28 (reopen)

- `ticket-reviewer`: clear. `npm run ci` green.
- **Trap for #41:** the `HorseDetail` board's form is 4 columns wide. Nine fields make it
  two full rows plus the note spanning the whole third row.
- **Trap for #42:** `instagram` arrives as `@handle`, `handle` or an `instagram.com/…`
  link. Normalise it on the server; the form does not.
