# E7.3 · RODO privacy notice — follow-up

Shipped 2026-10-03 — #59

## 2026-10-03 — built

`site.operator`, `PrivacyPage.astro`, the PL/EN copy and the boards (canvas v46,
`Privacy.dc.html` + `MobilePrivacy.dc.html`) are done, and `npm run ci` is green. The
reviewer's verdict was clear. The purge the notice promises is #142.

## 2026-10-03 — started

Plan approved. Approach comment posted on #59. Retention is the owner's call: six months
after an enquiry is marked handled.

## What was built — 2026-10-03

- `src/site.ts` `operator`: CEWET TAS sp. z o.o., address, KRS, NIP and REGON, from the KRS
  extract attached to #61. It is static rather than in `/site`, because these are
  registration facts and not editable content. #61 renders the same constant in the footer.
- `src/components/PrivacyPage.astro`: one column, sections in the order Art. 13 lists them.
  Controller, data and legal bases, processors (`<dl>`), then Turnstile with the Addendum
  link, transfers, X-ray reports, retention, rights, and other information. `{email}` in a
  paragraph becomes a `mailto:` link, and `{media}` becomes the host of `media.base`.
- `pages.privacy` in both dictionaries: `controller`, `data`, `processors.items[]`,
  `transfers`, `xray`, `retention`, `rights` and `other`. `turnstile` and `turnstileLink`
  are kept from #45.
- The two locale pages are thin wrappers, the same pattern as `pytania.astro`.
- Canvas: new `Privacy.dc.html` (1440×3500 at 4560,6658) and `MobilePrivacy.dc.html`
  (390×5050 at 12770,0). Note `t3`'s `maxW` went from 5090 to 5560.

## Outcome — 2026-10-03

The approach held as planned. Processors named: Google (Firebase), Microsoft 365, Resend,
Telegram, Umami Cloud, Cloudflare R2, and Cloudflare Turnstile separately.

Traps for the next person:

- "The email provider" is two processors: Resend sends, the Microsoft 365 `kontakt@`
  mailbox receives.
- Nothing deletes enquiries yet, so the six-month promise is kept by hand until #142 lands.
- The Telegram transfer line only points at Telegram's own policy. The DPF/SCC basis
  covers the US providers, not Telegram. A lawyer should read the notice before #63 goes
  live.
- The desktop board can't sit in the x=3040 column below 404, because the notes `n1`–`n6`
  sit at y=8740, x 0–3760.
- A canvas publish needs `root` under the scratchpad directory or the worktree.
  `$CLAUDE_JOB_DIR/tmp` is refused.
