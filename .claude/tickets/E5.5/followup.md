# E5.5 — followup

Shipped 2026-09-28. See the last `## Outcome` at the bottom.

Issue [#44](https://github.com/NF-Revolution/hanna-vavilava-site/issues/44) ·
branch `44-e55-email-sink`

## 2026-09-28

- Plan 01 approved. Blocker #42 is closed. Provider: Resend, chosen over Microsoft Graph and Postmark.
- Not visitor-visible, so no board read and no canvas change.
- `npm run ci` and `npm test` are green. `ticket-reviewer`: clear.

## What was built — 2026-09-28

- `enquiryEmail(record)` in `functions/enquiry.js` builds the email: plain Polish text, subject
  `Zapytanie: <horse | bez konia> — <name>, <country>`, one `label: value` line per field that
  is set, a `wa.me` link and an Instagram link. Select values go out as codes (`ponytail:`).
- `sendEnquiryEmail` in `functions/index.js`: a `POST` to `https://api.resend.com/emails` with the
  `RESEND_API_KEY` secret and a 10 s timeout, from `formularz@nfrevolution.com` to
  `kontakt@nfrevolution.com`. It throws on a missing key or a non-2xx response.
- `submitEnquiry` runs the DB push and the email under `Promise.allSettled`. It logs each failed
  sink as `enquiry: db:` or `enquiry: email:`. It answers 303 if at least one sink worked, and
  500 only if both failed.
- One pure test of `enquiryEmail` is in `tests/enquiry.test.mjs`.

Rejected: Microsoft Graph `sendMail` (an Entra app, Exchange RBAC scoping, and a secret that
expires), Postmark (paid past 100 emails a month), and SMTP (the ticket forbids it).

## Outcome — 2026-09-28

Shipped as planned. Traps:

- The emulator has no `RESEND_API_KEY`, so every emulator post logs `enquiry: email: RESEND_API_KEY
is not set`. That is expected: the DB sink still answers 303, and the existing endpoint test
  depends on exactly this. Do not add a `.secret.local` with a real key, or `npm test` sends real
  mail.
- The Resend domain `nfrevolution.com` (eu-west-1) was verified on 2026-09-30. Its records in
  Cloudflare are TXT `resend._domainkey`, plus the CNAMEs `rsend` and `send`, both DNS only, not
  MX and SPF as first planned. `_dmarc` is `p=none` with `rua` to `kontakt@`. The root SPF is
  unchanged.
- `kontakt@` must be a shared mailbox, as #5 decided. A Microsoft 365 group rejects external
  senders by default, so Resend showed `Bounced`, while the older `contact@` group had external
  senders allowed.
- Until #64 enables DKIM in Microsoft 365, keep DMARC at `p=none`.
- The addresses mirror `/site/email`. #63 changes the domain in `functions/index.js` as well.
