# E5.7 — followup

Shipped 2026-09-30. See the last `## Outcome` at the bottom.

Issue [#46](https://github.com/NF-Revolution/hanna-vavilava-site/issues/46) ·
branch `46-e57-confirmation-page-and-failure-ux`

## 2026-09-30

- Plan 01 approved. The only blocker, #42, is closed. The approach comment is posted on #46.
- The boards draw the desktop `Confirmation` only. No mobile board, no English board and no failure state.
- The `artboard-reader` summary claimed a 56px meta bar on `Confirmation`. The source has none, only a timestamp line above the h1. Build from the source when the summary and the source disagree.
- The first inline script went in as `{`...`}` inside a JSX fragment and rendered as literal text. `set:html` on `<script is:inline>` fixed it.
- `npm run ci` is green and `npm test` passes 52 of 52. Headless Chrome screenshots at 1440 and 390 look right. Headless Chrome crops at 390 on every page, the old ones too. That comes from its minimum window width, not from the layout.
- Canvas v42 has three changes:
  - `Confirmation` gains the sub-bar, the echo line and a `failed` tweak, and grows from 970 to 1040 px tall.
  - `MobileConfirmation` is new, at 390 × 1780.
  - Both draw both states.
- `ticket-reviewer` raised one high finding, and it is real. The page's echo regex allowed 6 to 15 digits, but the schema stores up to 29, so a 16-digit typo was never shown. The page now takes `^\+\d+$`. The schema is left alone.

## What was built — 2026-09-30

- `submitEnquiry` sends every refusal and failure as a 303 to `failedPath[locale]`:
  - the 400 parse failure
  - the 403 Turnstile refusal
  - both 429 rate limits
  - the 500 when both sinks are down
  - The locale comes from `body.locale`, defaulting to `pl`. The 405 for a non-POST stays plain, and every `logger.error` stays.
- `failedPath` sits beside `sentPath` in `functions/enquiry.js`, mirroring `enquiryFailed` in `routes.ts`.
- Success redirects to `sentPath[locale]#<stored whatsapp>`.
- `src/components/EnquiryDone.astro` draws both states, with props `locale` and `failed`. The layout is `Page`, then a `SubBar` holding the reply-window meta, then the h2, the body, and the actions: the WhatsApp button with its icon, and an underlined link with an arrow.
  - The sent state adds two things. First, a hidden echo line, which an inline script of about 170 bytes fills from `location.hash` (`^\+\d+$`, `textContent`). Second, the three steps, where step 01 takes `site.phone`. Its link goes back to the horses.
  - The failed state has no steps. Its link is "Spróbuj ponownie", back to the enquiry page.
  - Both states are `noindex`.
- The four pages are one-liners: `zapytanie/wyslane`, `zapytanie/niewyslane`, `en/enquiry/sent` and `en/enquiry/not-sent`.
- The copy is `pages.enquirySent.*` (heading, body, echo, steps, whatsapp, back) and `pages.enquiryFailed.*`, in both dictionaries. The English copy was written here, because no board draws English.
- `tests/enquiry.test.mjs` asserts the failure `location` for PL and EN, and the fragment on success.

## Outcome — 2026-09-30

- **Approach:** static failure pages behind a 303, and the phone number passed in the URL fragment, never the query string. Both pages come from one component.
- **Rejected:**
  - Rendering failure HTML in the Function: `functions/` cannot import the dictionaries.
  - A `fetch` submit that keeps the typed fields: the JS budget does not allow it.
  - The phone in the query string: it would reach the logs.
  - The board's timestamp: a static page cannot know the send time.
- **Traps for next time:**
  - Deploy `submitEnquiry` only after the hosting deploy that carries the not-sent pages. Otherwise a refusal redirects to a 404.
  - `failedPath` is mirrored like `sentPath`, and the test checks the Function's strings, not `routes.ts`.
  - The page's echo regex must accept everything the schema stores. A narrower regex hides exactly the typo the line is there to catch.
  - An inline script inside an Astro JSX expression needs `set:html`.
