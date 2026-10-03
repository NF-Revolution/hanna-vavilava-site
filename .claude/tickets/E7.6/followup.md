# E7.6 · Point-of-collection notice — follow-up

Shipped 2026-10-03 — #62

## 2026-10-03 — started

Plan approved. Blockers #59 and #40 closed. No board drew a notice near either form, so the
boards change in this pull request. "Both forms" is the enquiry form (enquiry page and the
horse page's dark band) and the search form on the enquiry page.

## What was built — 2026-10-03

- `src/components/FormNotice.astro`: one muted `.copy` sentence at 13px. It says the data
  is used only to answer the enquiry and is deleted six months after the enquiry is handled,
  and links to the privacy page through `path(locale, 'privacy')`. The sentence is split
  around `{privacy}`, the same idiom as `PrivacyPage.astro`'s `{email}`.
- Copy in `enquiryForm.notice` / `enquiryForm.noticeLink`, PL and EN. The retention wording
  matches `pages.privacy.retention`.
- The notice is the third item **inside** each send row (`.actions`, `.search-actions`):
  `flex: 1 1 280px`, max-width 420px, beside the contact links on desktop. Below 720px the
  rows stack, and `flex: none` stops the basis from setting the notice's height.
- The dark band takes `--ink-inv-muted` through `:global(.dark)`, as `ContactLinks` does.
- No consent checkbox: the basis is Art. 6(1)(b), pre-contractual steps.
- Canvas v50: Enquiry, EN-Enquiry, MobileEnquiry, HorseDetail and MobileDetail gained the
  line. The desktop boards kept their heights, because the notice fits the row's 88px. The
  390px boards grew: MobileEnquiry 3092 → 3270, MobileDetail 6954 → 7044.

## Outcome — 2026-10-03

`npm run ci` green, independent review clear. The plan put the notice below the send row.
It moved into the row while the boards were being drawn, because a line below the row
would have made every desktop board taller and pushed the boards stacked under them.

Trap: a canvas publish was refused once, because another session had changed
`canvas.json` (the Privacy heights) between our read and our publish. Re-read the index and
re-apply only your own keys.
