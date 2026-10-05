# E4.15 — followup

Shipped 2026-10-05 — see the last `## Outcome` at the bottom.

## 2026-10-05

- Plan 01 approved. Blockers: none. The approach comment is on #164.
- The address comes from the public listings (re-volta.pl, horsee.pl, the Google place): ul. Magnolii 2a, 96-321 Kaleń-Towarzystwo, gm. Żabia Wola. The entrance is from ul. Długa. Hanna has not confirmed it, so it stays `PLACEHOLDER`.
- Canvas v59 changed eight boards, copy only: `Footer`, `FooterMobile`, `About`, `MobileAbout`, `Confirmation`, `MobileConfirmation`, `Faq` and `MobileFaq`. No size changed, so `canvas.json` was not sent.
- `npm run ci` is green.

## What was built — 2026-10-05

Issue #164. Plan: one `stables` constant, with the name put into four copy lines through `fill()`.

1. `src/site.ts`: `stables` sits beside `operator`. It holds `name`, `street`, `postalCode`, `town`, `lat`, `lng` and `mapsHref`, and the address carries a `PLACEHOLDER` mark. #165 (the map) and #166 (directions) read it.
2. `pl.json` / `en.json`: the copy takes `{stables}`, plus `{town}` in the footer:
   - `footer.location`
   - `pages.about.steps[2]`
   - `pages.enquirySent.steps[1]`
   - `pages.faq.items[5]`, "how long to arrange a viewing", which gains a sentence
3. Each component passes `stables.name`:
   - `Footer.astro` (also `town`)
   - `AboutPage.astro`
   - `EnquiryDone.astro`
   - `FaqPage.astro`: it fills `items` once, so the FAQPage JSON-LD carries the name too.

## Outcome — 2026-10-05

**Approach:** The name is in apposition: "w stajni {stables}". "Stajnia" declines and the name stays in the nominative. The town appears only in the footer, after a comma, so it is never declined.
**Rejected:**

- The listing's full name, "… — Stajnia Sportowa". "W stajni … Stajnia Sportowa" says stable twice.
- A declined town in the prose.
- A change to FAQ Q3 (remote purchase). It names no place.

**Traps for next time:**

- "Stan stajni", "in the stable now" and the bio's "W stajni stoi" mean the stock, not the place. Leave them.
- The FAQ's answers are filled before the JSON-LD as well as before the markup. Fill one and not the other, and `{stables}` ships raw in the structured data.
- The ticket's "FAQ viewing answer" is Q6, about lead time. It never said "near Warsaw".
- For a #166 directions link, use `lat`/`lng`, not the address. The gate is on ul. Długa, not Magnolii.

**Files that mattered:** `src/site.ts`, `src/i18n/{pl,en}.json`, `src/components/{Footer,AboutPage,EnquiryDone,FaqPage}.astro`
