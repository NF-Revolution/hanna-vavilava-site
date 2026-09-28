# E5.1 (#40) — Enquiry form markup

## Context

`/zapytanie` and `/en/enquiry` are stubs. Ticket: eight fields, real labels, native
validation, plain form POST, zero JS. Phone field must demand leading `+` — Hanna cannot
call back a bare local number. Blocker #12 closed. No comments on #40. Endpoint is #42
(E5.3), prefilled horse-page variant is #41 (E5.2) — both out of scope.

Boards (Enquiry, EN-Enquiry, HorseDetail, MobileDetail): 2-col grid 1440, 1-col 390, gap
42px/60px, label `.lbl` muted, inputs bottom-border `--rule-field`, 15px, transparent,
padding 9px 0 11px; select with 11x7 chevron; note is single-line input; no required
markers, no error states, no consent line. Submit black button "Wyślij zapytanie" /
"Send enquiry" + underlined "Albo napisz na WhatsApp" / "Or message on WhatsApp".
Intro: h2 "Piszą Państwo bezpośrednio do Hanny." / "You are writing directly to Hanna." +
descriptor; subbar right "Odpowiedź w ciągu 1 godziny · {hours}".

## Approach

New `src/components/EnquiryForm.astro` (the `<form>`, reused by #41) and
`src/components/EnquiryPage.astro` (Page + SubBar + intro + form), like `FaqPage`. Both
`src/pages/zapytanie/index.astro` and `src/pages/en/enquiry/index.astro` become one line.

`<form method="post" action="/api/enquiry">` — `ponytail:` comment: E5.3 adds the Hosting
rewrite to `submitEnquiry` (adding it now fails deploy, function doesn't exist).

Fields, in board order, each `<label>` wrapping text + control:

| name      | control | constraints                                                                                                                          |
| --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| name      | text    | required, maxlength 100, autocomplete=name                                                                                           |
| country   | text    | required, maxlength 60, autocomplete=country-name                                                                                    |
| messenger | tel     | required, `pattern="\+[\d\s\-]{6,}"`, title = "number with country code, e.g. +48…", placeholder `+48 000 000 000`, autocomplete=tel |
| level     | select  | required, blank first option, codes `junior amateur110 amateur125 pro`                                                               |
| budget    | select  | required, codes `15-20 20-30 30-40 40plus`                                                                                           |
| timeframe | select  | required, codes `month quarter season browsing`                                                                                      |
| horse     | select  | required, `site.horsesListed` slugs + `undecided`; text `Name — formatPrice(...)`, name only when price null                         |
| note      | text    | optional, maxlength 2000                                                                                                             |

Option values are language-neutral codes so #42's zod enum and the inbox don't depend on
locale. Copy in `pl.json`/`en.json` under `enquiryForm` (labels, `options` maps keyed by
code, placeholder, title, submit, whatsapp) and `pages.enquiry` (heading, lead, meta).
Hours via `fill(..., { hours: site.responseWindow })`; WhatsApp via `whatsappHref()`.
Scoped CSS to board values, `@media (max-width: 720px)` single column + `--gutter-mobile`.
Chevron as CSS data-URI background on `appearance: none` select.

Skipped: honeypot, time trap, locale hidden field (E5.3 owns them with the endpoint);
error styling (not drawn; native bubble); preselect (E5.2). No artboard change — code
matches boards; only drift is price format `32 000 €`, already logged.

## Steps

1. After approval: `gh issue develop 40 --base main --checkout`; create
   `.claude/tickets/E5.1/` (INDEX.md, plans/01-form-markup.md, followup.md); post approach
   comment on #40.
2. Build components, strings, pages.
3. `npm ci` (fresh worktree) then `npm run ci`.
4. `ticket-reviewer`, fix real findings.
5. Tick ACs; finalize ticket folder; `create-pr`; outcome comment on #40 + field contract
   note on #42 (names, codes, `+` rule).

## Verification

- `npm run ci` green (format, types, structural i18n check, build, links).
- `npm run dev`: both pages render, submit empty → native bubbles; `600100200` in
  messenger rejected, `+48 600 100 200` accepted; 390px single column; built HTML has no
  `<script>` added.
