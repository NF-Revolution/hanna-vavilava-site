# Ticket map

Tickets live in GitHub Issues: <https://github.com/NF-Revolution/hanna-vavilava-site/issues>
One milestone per epic (E0–E8), one `epic:*` label per issue, blockers linked as `#N`.

Full plan: `~/.claude/plans/i-have-a-design-fancy-church.md`
Design: Artifact canvas `F7qeoBwkyu2Dau5p1iLg2n` ("Hanna Vavilava — sales site")

## State

| Ticket                       | Issue              | State                                                         |
| ---------------------------- | ------------------ | ------------------------------------------------------------- |
| E1.1 repo, Astro, TS, CI     | #6                 | done                                                          |
| E1.5 design tokens           | #10                | done                                                          |
| E1.6 self-hosted fonts       | #11                | done                                                          |
| E1.7 base layout             | #12                | done                                                          |
| E1.8 shared footer           | #13                | done                                                          |
| E1.9 menu drawer             | #14                | done                                                          |
| E7.1 localised routing       | #57                | done                                                          |
| E1.2 Firebase project        | #7                 | done — `hanna-vavilava-site` on Blaze                         |
| E1.3 Actions deploy          | #8                 | done — live on `hanna-vavilava-site.web.app`                  |
| E1.4 preview channel         | #9                 | done — a channel per PR, 14d, verified on #76                 |
| E1.10 accessibility baseline | #15                | done                                                          |
| E1.11 media bucket           | #69                | done — `hanna-vavilava-media` on `hv-media.nfrevolution.com`  |
| E2.1 database shape, rules   | #16                | done — `src/horse.ts`, admin-only rules, `npm test`           |
| E2.2 build-time loader       | #17                | done — `src/content.config.ts`, fixture fallback, prod seeded |
| E0.1 video hosting           | #1                 | decided — Cloudflare R2, setup is #69                         |
| E0.2 price display           | #2                 | decided — price per horse, `null` = on request                |
| E0.3 seller identity         | #3                 | decided — per-horse kind, values pending in #61               |
| E0.4 X-rays                  | #4                 | decided — PDF study, public download                          |
| E0.5 domain and mailbox      | #5                 | decided — nfrevolution.com now, hannavavilava.com at E8.1     |
| everything else              | see the milestones | not started                                                   |

## Decisions made along the way

- Astro 7.3.3, not 5 — that is what `npm create astro` installs now.
- Realtime Database, not Firestore (owner's call). Content is read once at build
  time, so Firestore's per-document read model bought nothing, and one JSON tree
  priced on bandwidth is the predictable number. Paths: `/horses`, `/enquiries`,
  `/subscribers`, `/site`.
- Three colours deviate from the artboards, and E1.10 repainted the boards to
  match rather than the other way round. The tertiary greys `#8D8B83` (3.13:1)
  and `#6E6D68` (3.73:1) fail WCAG AA at the 10–11px sizes they are drawn at,
  so they are folded into `--ink-muted` and `--ink-inv-faint`; `--rule-field`
  `#C9C7C0` is 1.55:1 on the light ground, and a form-input border is a UI
  component under SC 1.4.11, so it became `#8F8D87` (3.01:1) before E5.1 could
  build to it. The canvas note that claims "text runs at 4.5:1 or better on
  both grounds" was false while those greys were on the boards; making it true
  is the designer's sign-off the ticket asked for.
- The grid view is a second static route, not a JS toggle — shareable,
  crawlable, and less code (E4.3).
- The homepage scrim is an addition — the boards draw none — because text over
  moving video has no guaranteed contrast, and the worst case is a white frame,
  not `--ground-dark`. Two strengths, both computed against white: `--scrim`
  `rgba(14,14,13,0.62)` carries `--ink-inv` at 4.79:1, `--scrim-strong`
  `rgba(14,14,13,0.84)` carries `--ink-inv-muted` at 4.71:1, and
  `--ink-inv-faint` never goes over video at all — no alpha short of opaque
  carries it. It covers the overlay header as well as the entry cue and the
  bottom edge; the header had no scrim before E1.10 and its status line is
  muted ink.
- The sub-bar label is each page's `<h1>`. One element, no visual change, and
  every page E4.x adds gets its heading for free (E1.10).
- `scripts/check-a11y.mjs` runs in `npm run ci` after the link check: token
  contrast, the scrim floors, one `<h1>` per page, named `<nav>` landmarks,
  `alt` on images, `aria-label` on icon-only controls. Regex and arithmetic, no
  dependency — axe-core behind a headless browser is the named upgrade.
- The artboards have no sold-horse state. Raised in E2.8.
- Video lives on Cloudflare R2, played by a native `<video>` behind the facade —
  not YouTube, not Firebase (E0.1). The homepage hero has to be a local element
  anyway, so an embed would have been a second video system; and R2 is the only
  option that charges nothing for egress, where Firebase Hosting bills $0.15/GB
  past 10 GB a month and a 4 MB autoplaying hero spends that in ~2 500 visits.
  One ffmpeg script (E3.2) covers the hero and the sales clips. YouTube stays a
  marketing channel and never the site's player. Cloudflare Stream (~3 EUR/mo)
  is the named upgrade if Hanna ever needs to upload video herself.
- Price is shown per horse, not hidden behind "on request": `price: number | null`
  in EUR, and the figure is always the total the buyer pays. The VAT treatment rides
  on one `seller: 'company' | 'private'` enum, which also answers E0.3's per-horse
  half — the seller's tax status is what decides whether there is a VAT invoice, so
  one field covers both tickets. Bands are the named upgrade (#2, #3).
- The site never gains a checkout. A price plus an online pay-or-reserve button makes
  it a distance contract, with a 14-day withdrawal right on a live animal; as an
  advertisement it is an invitation to treat under art. 71 KC. Anyone adding a payment
  step is changing the legal shape of the site, not the UI (#2).
- Client-owned horses are advertised, their owners are not named — publishing a private
  person's details has no need behind it. The footer instead says that Hanna sells her
  own horses and offers clients' horses, and the sale kind sits on each horse page (#3).
- The domain is decided but not yet bought: `hannavavilava.com` is the production
  origin with `hannavavilava.pl` redirecting to it, registered at E8.1 (#63). Both were
  unregistered on 2026-09-21. Until then the site rides on the Firebase `.web.app` URL
  through the `SITE_URL` repository variable — no interim DNS record, no certificate,
  nothing thrown away at launch. `hv-media.nfrevolution.com` is the one exception,
  because R2's `.r2.dev` host is rate-limited and not for production, and that zone is
  already on Cloudflare (#5, #69). The label is `media` rather than `video` because #4
  put the X-ray PDFs in the same bucket.
- The mailbox is a shared mailbox `kontakt@` on the Microsoft 365 tenant that already
  serves `nfrevolution.com` — free, no extra licence, its own Sent Items, and Hanna can
  be granted access without touching anyone's personal mailbox. The provider is settled
  permanently; only the domain part of the address changes at E8.1. `nfrevolution.com`
  has no `_dmarc` record today, which is E8.2's first job (#5, #64).
- The X-rays are a radiograph study published as downloadable PDFs, not a gallery and
  not a bare metadata list (E0.4). The count, date and scope stay on the page — they are
  what a buyer reads before spending 24 MB — and the films are never rendered as images,
  because the buyer's next move is forwarding the study to their own vet. The download is
  public: a gate that works needs a signed URL and a buyer auto-reply nobody planned, and
  a cheap gate is decorative once someone opens the page source. The files sit on R2 with
  the video, because a PDF is a delivery asset served raw and not a build input Astro
  re-encodes — so #69's subdomain is `media.` rather than `video.`. The horse owner is
  redacted from page 1 before upload and the examining vet is not (#3), and the objects
  are deleted when the horse sells (#23). Upload is #70.
- The Firebase project is `hanna-vavilava-site` on Blaze (E1.2). Realtime Database in
  `europe-west1` at `https://hanna-vavilava-site-default-rtdb.europe-west1.firebasedatabase.app`;
  Storage and Functions in `europe-central2`, which is Warsaw itself. The database sits in a
  different region from everything else because Realtime Database has no Warsaw location
  and content is read once at build time, so the hop is paid by CI and never by a visitor.
  The project carries two Hosting sites and the default is `hanna-vavilava-site` — the
  project's `resources.hostingSite`, which is the field `firebase deploy` resolves. The
  console's `hanna-vavilava-site-4baa3` is a different field, the web app's linked site,
  and it only feeds that app's `/__/firebase/init.js`. So `SITE_URL` is
  `https://hanna-vavilava-site.web.app` and `firebase.json` pins
  `"site": "hanna-vavilava-site"`. The pin is one line and permanent — a custom domain
  attaches to a site rather than renaming one, so #63 does not throw it away — and it keeps
  the deploy target readable in the repo instead of inferred from an API call, which is how
  the earlier `-4baa3` reading survived unchallenged until the first real deploy (E1.3).
  `hanna-vavilava-site-4baa3` stays a 404 and Firebase does not allow deleting it.
  No `.firebaserc`: the project id already lives in the `FIREBASE_PROJECT_ID`
  repository variable and both workflows pass it explicitly. #16 did not need one either —
  the emulator runs on `--project demo-hv`, which cannot reach production by construction.
- The preview workflow skips a fork's pull request rather than failing it. The repo is public
  and a `pull_request` from a fork gets no secrets, so `FIREBASE_SERVICE_ACCOUNT` arrives empty
  and the deploy step fails every time; `vars.FIREBASE_PROJECT_ID != ''` does not catch it,
  because repository variables _are_ readable from fork pull requests and only secrets are
  withheld. The trigger stays `pull_request`, never `pull_request_target` — fork code must not
  run with secrets. Preview channel URLs are public and reachable from the bot's pull-request
  comment, and what keeps them out of the index is the absolute `<link rel="canonical">` in
  `Base.astro`, which points at production. `robots.txt` still has to be `Disallow: /` on a
  preview build when E6.4 writes one (#9, #53).
- The media bucket is `hanna-vavilava-media`, location hint `eeur`, served only through the
  custom domain `hv-media.nfrevolution.com` with minimum TLS 1.2 — the `.r2.dev` URL stays
  disabled (E1.11). No EU jurisdiction: the assets are public and hold no personal data, and
  `-J eu` would have to ride on every later command. `Cache-Control: public, max-age=31536000,
immutable` is object metadata set at upload rather than an edge rule, because the zone is
  shared with another brand and the encode script is the only uploader; the value, the bucket
  and the base live once in `site.media`, which Node imports straight from `src/site.ts`.
  `wrangler` runs as `npx wrangler@4`, not a devDependency — CI never touches R2.
- No client writes to the database at all — every path is `auth.token.admin === true` (E2.1).
  #16 first had `/enquiries` and `/subscribers` open for anonymous create-only pushes, but
  #42 writes enquiries from a Cloud Function behind Turnstile, a honeypot and a per-IP rate
  limit, and #48 needs double opt-in; the Admin SDK skips the rules, so an open write was
  only a door around those. The admin is a custom claim, not a uid or an email in the rules:
  E2.3 sets it once with `setCustomUserClaims(uid, { admin: true })`, and until then every
  read from the panel is denied. The horse schema is `src/horse.ts`, on Astro's own zod, and
  it is a `strictObject` so an `owner` field fails the parse. The rules tests are `node:test`
  plus `fetch` against the emulator's REST API with unsigned tokens — no
  `@firebase/rules-unit-testing` — and run as `npm test` through `npx firebase-tools@15`,
  in its own CI step with Java, so `npm run ci` stays Java-free.
- Content is read at build time, not fetched in the browser, even though the owner asked
  for live edits (E2.2). A horse edit still needs no hand redeploy: the Publish button
  (E2.6) sends `repository_dispatch` and `deploy.yml` rebuilds in a minute or two. A
  browser read would have cost crawlable horse pages, WhatsApp link previews, the 1 KB
  JavaScript budget and the admin-only read rules. `src/content.config.ts` reads `/horses`
  and `/site` — never the root, which holds enquiries — through `firebase-admin`, and
  deletes the app afterwards, because the open socket keeps `astro build` from exiting.
  Without `FIREBASE_SERVICE_ACCOUNT` the build reads `src/fixture.json`; that covers
  `npm run ci`, forks and local dev, and it can never reach live, because the hosting
  deploy needs the same secret. `/site` holds the contact details, `responseWindow` and
  `updated`; the stock count and the featured horse are derived from `/horses`, never
  stored. `site.media` moved to `src/media.ts`, because `site.ts` now imports
  `astro:content` and neither `astro.config.mjs` nor a plain Node script can.
- The homepage's bottom-edge horse line is omitted when the stable is empty, and its price
  segment when the price is `null` — two states no board draws. The "on request" label
  comes with E4.x's boards; the empty stable is E2.8's sold-state question (E2.2).
