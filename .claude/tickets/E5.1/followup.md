# E5.1 — followup

Reopened 2026-09-28 — WhatsApp-only contact field, optional Instagram (owner decision).

Issue [#40](https://github.com/NF-Revolution/hanna-vavilava-site/issues/40) ·
branch `40-e51-enquiry-form-markup` · canvas `F7qeoBwkyu2Dau5p1iLg2n` version 35

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
