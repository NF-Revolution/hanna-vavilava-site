# E7.5 — followup

Shipped 2026-10-03 — see the last `## Outcome` at the bottom.

## 2026-10-03

- KRS extract on #61 read (owner comment). Body lacked KSH art. 206 §1 court + capital → body fixed before build
- built: `seller` in `src/site.ts`, footer legal block, `footer.registry/court/stock`, LocalBusiness address; canvas Footer 310→420, FooterMobile 690→940 (moved y 5438→5548)
- homepage + menu have no footer by design (#13); legal block one click away
- reviewer: clear
- rebased on #59 (#143), which had added `operator` in `src/site.ts` from the same KRS extract → `seller` folded into it (court, capital, vatId, postalCode split from city; `PrivacyPage.astro` prints `postalCode city`); main's `CEWET TAS sp. z o.o.` and `19J lok. 5` kept, boards matched
  next: none — shipped.

## What was built — 2026-10-03

Issue #61.

### Problem

UŚUDE art. 5 needs the operator's identity reachable from every page. Footer still shows
`Stajnia [PLACEHOLDER]`. Owner comment: sp. z o.o., VAT payer, KRS extract attached.
Blocker #13 closed. Values read from the KRS extract (stan na 15.07.2026, no later changes):

- CEWET TAS SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ — shown as `Cewet Tas sp. z o.o.` (KSH art. 160 §1 allows the abbreviation)
- ul. Kąty Grodziskie 19J/5, 03-289 Warszawa
- KRS 0001015121 · NIP 5242961289 · REGON 524266376 (KRS stores 14-digit `…600000`, the main-unit form; 9 digits is the entity)
- Sąd Rejonowy dla m.st. Warszawy w Warszawie, XIV Wydział Gospodarczy KRS
- kapitał zakładowy 5 000 PLN; VAT payer: yes

**Surprise → fix ticket body first:** sp. z o.o. on a website also owes KSH art. 206 §1 —
registry court and share capital. Body lists neither (filed before legal form known). Add them
to "Needed" and "Done when" before building.

Board (Footer, FooterMobile): brand column = wordmark, `Stajnia [PLACEHOLDER]`, location.
No NIP/REGON, no own/clients sentence drawn → canvas update owed in same PR.

### Steps

1. `src/site.ts` — one `seller` const beside `umami` (legal facts, not owner-editable, so not
   the DB `/site` node): `name, street, postalCode, city, krs, nip, regon, court, capital, vatId` (built: `vatId: 'PL5242961289'` replaced the planned `vatPayer: true` boolean, which `fill()`'s `Record<string, string | number>` rejects and which the JSON-LD `vatID` needs anyway).
2. `src/i18n/{pl,en}.json` — drop `footer.stable`; add
   - `footer.registry`: `KRS {krs} · NIP {nip} · REGON {regon}` (both)
   - `footer.court`: PL `{court} · kapitał zakładowy {capital}`, EN `Registry court: {court} · share capital {capital}`
   - `footer.stock`: PL `Sprzedaję własne konie i oferuję konie klientów — dane właściciela przed umową.`
     EN `I sell my own horses and offer horses owned by clients — owner details before contract.`
     (first-person, matches `about.bio` voice)
3. `src/components/Footer.astro` — brand column: wordmark; location line; muted legal block
   (name / address / registry / court via `fill` from `src/i18n/format.ts`); `stock` sentence.
   Remove PLACEHOLDER comment at :36. Reuse `.foot-address` styling.
4. `src/components/HomeScreen.astro:62` — fill LocalBusiness `address` (street, postal code,
   locality) and `legalName`, `vatID` from `seller`; remove its E7.5 PLACEHOLDER.
5. Canvas — `artboards` skill: Footer + FooterMobile get the same lines.
6. `.claude/tickets/INDEX.md` row E0.3 → values landed in #61; decision line for abbreviated
   firm name + 9-digit REGON.

Rejected: values in DB `/site` (schema + editor change for facts that change by court entry only);
showing full uppercased registered name (46 chars, legal abbreviation is allowed).

### Ritual

Approach comment on #61 → `gh issue develop` branch (worktree already `worktree-e7-5`; checkout
issue branch) → ticket-notes `E7.5/` → build → `npm ci && npm run ci` → `ticket-reviewer` →
`create-pr` → finalize notes → outcome comment.

### Acceptance

`npm run ci` green. `npm run dev`: footer on `/` and `/en/` and a horse page shows name,
address, registry, court/capital, sentence; mobile 390px wraps without overflow. JSON-LD on
home has PostalAddress with street. `grep -rn PLACEHOLDER src/components/Footer.astro src/i18n` empty for footer.

## Outcome — 2026-10-03

**Approach:** legal identity as one `operator` const (shared with #59's privacy notice) in `src/site.ts` (changes only by court entry, so not DB `/site`); footer brand column renders it via `fill()` from `src/i18n/format.ts`.
**Bugs met:** `vatPayer: true` broke `fill(dict.footer.registry, seller)` typing → swapped for `vatId` string.
**Rejected:** values in DB `/site` (schema + editor field for facts owner never edits); full uppercase registered name (46 chars, KSH 160 §1 allows `sp. z o.o.`); 14-digit REGON (main-unit form).
**Traps for next time:** #59 landed the same KRS facts in parallel as `operator`; check `src/site.ts` on main before adding a const. KRS JSON read blocked by auto-mode PII classifier until user allowed it. Artifact publish `root` must sit under the scratchpad dir, not `$CLAUDE_JOB_DIR/tmp`. Board height change = size triple + `canvas.json` + neighbour board `y`.
**Files that mattered:** `src/site.ts`, `src/components/Footer.astro`, `src/components/HomeScreen.astro`, `src/i18n/pl.json`, `src/i18n/en.json`
