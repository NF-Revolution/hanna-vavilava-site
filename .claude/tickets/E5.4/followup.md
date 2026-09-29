# E5.4 — followup

Shipped 2026-09-28. See the last `## Outcome` at the bottom.

Issue [#43](https://github.com/NF-Revolution/hanna-vavilava-site/issues/43) ·
branch `43-e54-telegram-notification`

## 2026-09-28

- Plan 01 approved. Blocker #42 is closed. The approach is posted on #43.
- The artboards were not read: the form gains only hidden fields, and nothing a visitor sees changes.
- The issue body is the whole spec, with no comments. #56, the UTM convention, only documents
  the tags. Capturing them into the enquiry is this ticket's job.
- `npm test` passes 50 of 50. With no secrets, the emulator reaches the real Telegram API with
  an empty token and gets a 404, which is logged. The enquiry is still stored and still gets
  its 303.
- `ticket-reviewer`: clear.

## What was built — 2026-09-28

- `functions/notify.js` is pure, with no Firebase:
  - `labels` copies the Polish option texts, and the test holds them equal to `pl.json`.
  - `escape` escapes for Telegram's HTML mode.
  - `waReply` builds `wa.me/<digits>?text=<greeting>`. The EN greeting uses the first name.
    The PL greeting has none, because the vocative needs the buyer's gender. `undecided` drops
    the horse from the greeting.
  - `telegramMessage` returns the `sendMessage` body in Polish:
    - the horse and the locale
    - the name and the country
    - WhatsApp, and Instagram, linked only when the handle is `[\w.]+`
    - the three labels
    - the note, the page and the source
    - one inline-keyboard button, "Odpowiedz na WhatsApp"
- `functions/enquiry.js`:
  - The schema gains `page` and `ref`, `text(500)` each.
  - `campaign(page, ref)` returns the first of these that exists:
    1. the `utm_source / utm_medium / utm_campaign` of the page
    2. the same tags of the referrer
    3. the host of an outside referrer
  - `parseEnquiry` stores `source` and drops `ref`.
- `functions/index.js`:
  - `TELEGRAM_TOKEN` and `TELEGRAM_CHAT` are secrets on `submitEnquiry`, and the setup steps
    are in the header.
  - `notify(record)` runs after the `push()` and is awaited before the 303. It reads the horse
    name, falling back to the slug if the read fails, then sends, with a 5 s timeout.
  - A failure only reaches `logger.error`.
- `EnquiryForm.astro` has hidden `page` and `ref` inputs, and the inline submit listener fills
  them from `location.href` and `document.referrer`.

## Outcome — 2026-09-28

- **Approach:** store first, then notify, and never fail the request because Telegram did. The
  campaign is read from the form page and the page before it, and nothing is stored in the
  browser.
- **Rejected:**
  - A first-visit source in `sessionStorage`. It stores data on the device and needs a ruling
    under #59.
  - A 500 when Telegram fails. The enquiry is already saved.
  - The `Referer` header for the page.
- **Traps for next time:**
  - The Function deploys only once both secrets exist. Until the hand deploy, production keeps
    the E5.3 Function, which strips `page` and `ref`.
  - A missed Telegram message is only an error log line. #49 must alert on
    `enquiry telegram:`.
  - The source reaches back one page only. "bio → homepage → horses list → horse" loses it.
  - The search form (#126) posts no `page` or `ref` yet, and its records need their own message
    layout in `telegramMessage`.
  - #59's privacy notice must name Telegram as a processor. The message carries the buyer's
    name, number and note.
