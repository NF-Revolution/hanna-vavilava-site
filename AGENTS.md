# hanna-vavilava-site

Sales site for Hanna Vavilava, show jumping horses near Warsaw. Built from the
artboard canvas "Hanna Vavilava — sales site". The site has one job: put an
enquiry in front of Hanna within an hour.

## Stack

Astro, static output, TypeScript strict. Plain CSS custom properties, no
framework, no CSS library, and no hydrated islands — public pages ship under
1 KB of JavaScript and it stays that way. The Realtime Database holds the horses and is
read at build time; the admin panel is the only client-rendered route.

## Conventions

- Every link goes through `path(locale, routeKey, slug)` in `src/i18n/routes.ts`.
  Nothing hardcodes a URL — the same table feeds the language switch and hreflang.
- Every user-visible string lives in `src/i18n/pl.json` and `src/i18n/en.json`.
  The two files are structurally identical; `src/i18n/index.ts` enforces it.
- Contact details and stock counts come from `src/site.ts`. Nothing else
  hardcodes a phone number.
- Values still to be replaced with real ones are marked `PLACEHOLDER`.
- Deliberate simplifications are marked `ponytail:` with the upgrade path.

## Commands

    npm run dev      # dev server
    npm run ci       # format check, types, build, internal link check
    npm run fonts    # re-download the webfonts and regenerate fonts.css
