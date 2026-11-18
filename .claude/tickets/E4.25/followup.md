# E4.25 · Location says only Warszawa: no stable name, address, map or directions

Status: shipped at the pull request 2026-11-17 · #200

## What was built — 2026-11-17

Hanna asked for the location to be reduced to the city: the stable's name alone finds the gate
on Google Maps.

- `src/site.ts`: `stables` and `directionsHref` deleted outright, not reduced. The city is
  per-locale copy and `status.city` ("Warszawa, Polska" / "Warsaw, Poland", already in the
  header status bar) holds it. AC1 on #200 amended to say so.
- Horse page: the Location row reads `status.city`, no link. Location was the only row using
  the facts table's third "link" slot, so the slot, its `Link` type and its render block went.
  `.fact-link` CSS stays — the livejumping links use it.
- Footer: location line is `status.city`, no Directions link; `.foot-directions` CSS gone.
- About: the whole "Gdzie stoją konie" section (address, Maps link, iframe) deleted.
- Enquiry sent: the step-02 Directions link deleted.
- FAQ: no more `fill(..., { stables })`; `page.items` used directly.
- Copy, both locales: About step 03, FAQ viewings answer and sent step 02 say "pod Warszawą" /
  "near Warsaw" and that the address comes once a viewing is arranged. Keys removed:
  `footer.location`, `footer.directions`, `pages.about.map`, `enquirySent.directions`.
- Privacy notice: the four Google-map passages removed (data, transfers, device, and the
  "Google Maps link beside the stables' address" sentence). Operator block untouched.
- Canvas v84: HorseDetail, MobileDetail, Footer, FooterMobile, About (2672 → 2073 px),
  MobileAbout (3265 → 2710 px), Confirmation, MobileConfirmation, Faq, MobileFaq. Sold and EN
  boards draw no location.

## Outcome — 2026-11-17

Owner decisions: sentences say "pod Warszawą" (accurate: the stable is ~40 km out, and it
matches the home h1), not "w Warszawie"; the About map section goes whole; the privacy map
passages go in this PR. Reviewer: clear.

Traps for next time:

- The name hides in copy as `{stables}` — removing the object without rewriting the sentences
  breaks three sentences ("w stajni …"). Grep the JSON for the placeholder, not just the code.
- The privacy notice described the map in four places; a removed third-party embed is also a
  privacy-notice change.
- Example results link to livejumping competitions; rounds at the home stable's own shows
  name the venue on livejumping. Not this ticket's data, but the same leak — Hanna's call.
- The `artboards` publish `root` must sit under the working directory, not `$CLAUDE_JOB_DIR`.
