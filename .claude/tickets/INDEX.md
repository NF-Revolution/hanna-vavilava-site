# Ticket map

Tickets live in GitHub Issues: <https://github.com/NF-Revolution/hanna-vavilava-site/issues>
One milestone per epic (E0–E8), one `epic:*` label per issue, blockers linked as `#N`.

Full plan: `~/.claude/plans/i-have-a-design-fancy-church.md`
Design: Artifact canvas `F7qeoBwkyu2Dau5p1iLg2n` ("Hanna Vavilava — sales site")

## State

| Ticket                       | Issue              | State                                                                       |
| ---------------------------- | ------------------ | --------------------------------------------------------------------------- |
| E1.1 repo, Astro, TS, CI     | #6                 | done                                                                        |
| E1.5 design tokens           | #10                | done                                                                        |
| E1.6 self-hosted fonts       | #11                | done                                                                        |
| E1.7 base layout             | #12                | done                                                                        |
| E1.8 shared footer           | #13                | done                                                                        |
| E1.9 menu drawer             | #14                | done                                                                        |
| E7.1 localised routing       | #57                | done                                                                        |
| E1.2 Firebase project        | #7                 | done — `hanna-vavilava-site` on Blaze                                       |
| E1.3 Actions deploy          | #8                 | done — live on `hanna-vavilava-site.web.app`                                |
| E1.4 preview channel         | #9                 | done — a channel per PR, 14d, verified on #76                               |
| E1.10 accessibility baseline | #15                | done                                                                        |
| E1.11 media bucket           | #69                | done — `hanna-vavilava-media` on `hv-media.nfrevolution.com`                |
| E1.12 preview channel delete | #134               | done — `cleanup` job in `preview.yml` deletes `pr<N>-*` on close            |
| E1.13 drawer outside click   | #167               | done — click beside the panel closes it, press start checked                |
| E2.1 database shape, rules   | #16                | done — `src/horse.ts`, admin-only rules, `npm test`                         |
| E2.2 build-time loader       | #17                | done — `src/content.config.ts`, fixture fallback, prod seeded               |
| E2.3 admin shell             | #18                | done — `/admin`, Firebase Auth, `npm run admin:grant`                       |
| E2.4 admin horse editor      | #19                | done — list, reorder, status, every field PL/EN                             |
| E2.5 admin photo upload      | #20                | done — Storage, 2400 px, EXIF stripped, alt required                        |
| E2.6 publish button          | #21                | done — `functions/` `publish`, live in `europe-central2`                    |
| E2.7 admin enquiry inbox     | #22                | done — `/admin` lists `/enquiries`, ticks `handled`                         |
| E2.8 sold-horse handling     | #23                | done — trimmed sold page, Publish deletes and purges X-rays                 |
| E2.9 seed real horses        | #24                | done — 2 horses, invented facts, unpublished; rest in #91                   |
| E2.10 X-ray PDF upload       | #70                | done — presigned PUT to R2, owner tick, Save deletes + purges               |
| E2.12 livejumping starts     | #110               | done — `refreshStarts` button + `startsWeekly`, not deployed                |
| E2.13 starts height, season  | #122               | done — string `wysokosc_p`, one season reads as a sentence                  |
| E2.14 enquiry inbox page     | #158               | done — `/admin/zapytania` lists, `/admin` counts unhandled live             |
| E2.15 preview build          | #184               | done — `preview` callable, `draft.yml` to channel `draft`, not deployed     |
| E3.1 responsive picture      | #25                | done — `Photo.astro`, size inferred at build, CI checks size                |
| E3.5 gallery lightbox        | #29                | done — `Gallery.astro`, mounted on the detail page by E4.5                  |
| E3.6 photo intake guide      | #30                | done — `/admin/poradnik`, Polish, limits imported from code                 |
| E3.7 gallery scroll, swipe   | #150               | done — scroll-snap list, × close, gallery script 524 B                      |
| E3.3 hero player             | #27                | done — gated `<video>`, keys in `src/media.ts`, still `null`                |
| E3.4 sales video facade      | #28                | done — `Video.astro`, native player, mounted by E4.5                        |
| E4.1 homepage                | #31                | done — fixed viewport, MobileHome two bars                                  |
| E4.2 horses index, editorial | #32                | done — `HorsesIndex.astro`, `site.horsesListed`, canvas v24                 |
| E4.3 horses index, grid      | #33                | done — `HorsesGrid.astro`, `ViewSwitch.astro`, 4:3 cards                    |
| E4.4 horse detail page       | #34                | done — `HorseDetail.astro`, price and sale rows, canvas v26                 |
| E4.5 detail videos, gallery  | #35                | done — heading row, free-text `videos[].note`                               |
| E4.6 about page              | #36                | done — `AboutPage.astro`, 3:4 portrait beside the bio                       |
| E4.7 questions page          | #37                | done — `FaqPage.astro`, native `<details>`, `CtaBand.astro`                 |
| E4.8 390px mobile pass       | #38                | done — `MobileBar.astro`, sticky WhatsApp + form bar                        |
| E4.9 404 page                | #39                | done — `NotFound.astro`, text list of horses, `noindex`                     |
| E4.14 list whole horse       | #160               | done — photo sets the row height, stack at 1024, canvas v58                 |
| E4.15 name the stables       | #164               | done — `stables` in `site.ts`, `{stables}` in four lines, canvas v59        |
| E4.16 map of the stables     | #165               | done — lazy Google map, Google named in the notice, canvas v63–v65          |
| E4.17 directions link        | #166               | done — `directionsHref` from lat/lng, footer + sent step 02, canvas v61     |
| E4.18 whole entry opens      | #172               | done — stretched `.more::after`, hover/focus/touch states, canvas v62       |
| E4.19 hero scroll cue        | #176               | done — centred cue on a veil after 4 s at top, hides on scroll, canvas v67  |
| E4.20 media-first detail     | #179               | done — video strip, one description, 5 fewer fields, canvas v68             |
| E5.1 enquiry form markup     | #40                | done — `EnquiryForm.astro`, coded select values, `+` phone                  |
| E5.2 prefilled, search forms | #41                | done — dark form on horse page, `kind=search`, canvas v38                   |
| E5.3 submitEnquiry endpoint  | #42                | done — `/api/enquiry` rewrite, zod, traps, 5/IP/h, deployed                 |
| E5.4 Telegram notification   | #43                | done — PL message, `wa.me` greeting button, `page`, `source`                |
| E5.5 email sink              | #44                | done — Resend beside the DB write, 303 if either sink worked                |
| E5.6 Turnstile               | #45                | done — invisible widget, siteverify, 20/h cap, canvas v39                   |
| E5.7 confirmation, failure   | #46                | done — `EnquiryDone.astro`, 303 to not-sent, number in `#`                  |
| E5.8 contact links           | #47                | done — `ContactLinks.astro` by every form, prefilled, canvas v41            |
| E5.10 endpoint monitor       | #49                | done — daily `enquiryProbe`, uptime check, alerts by hand                   |
| E5.11 search form endpoint   | #126               | done — `searchSchema`, `kind: search` in both messages, deploy owed         |
| E5.12 simpler next steps     | #151               | done — two sent-page steps, phone call on About and FAQ, canvas v53         |
| E6.1 head component          | #50                | done — `Base.astro`, horse description, hreflang check in CI                |
| E6.2 link preview cards      | #51                | done — cover cropped to 1200×630 JPEG, size gated in `links`                |
| E6.3 structured data         | #52                | done — `JsonLd.astro`, Product only when priced, `links` gate               |
| E6.4 sitemap and robots      | #53                | done — `site.indexable`, own sitemap endpoint, consoles at #63              |
| E6.6 analytics               | #55                | done — Umami EU beacon in `Base.astro`, site `hanna-vavilava-site.web.app`  |
| E6.5 icons and manifest      | #54                | done — owner's logo, rasters by sharp at build, canvas v44                  |
| E6.7 campaign tagging        | #56                | done — UTM vocabulary in `README.md`, read in Umami, no code                |
| E7.2 English pass            | #58                | done — EN board copy, `19.09.2026` dates, `EUR` code, half-pair check       |
| E7.3 privacy notice          | #59                | done — `PrivacyPage.astro`, `site.operator`, purge owed in #142, canvas v46 |
| E7.6 point-of-collection     | #62                | done — `FormNotice.astro` in every send row, no checkbox, canvas v50        |
| E7.4 technology statement    | #60                | done — `#cookies` section in the privacy notice, footer links, canvas v51   |
| E7.8 no Russian              | #152               | done — footer languages and bio in both dictionaries, canvas v57            |
| E7.7 retention purge         | #142               | done — daily `retention` job, `handledAt` + `sale`, monthly routine         |
| E0.1 video hosting           | #1                 | decided — Cloudflare R2, setup is #69                                       |
| E0.2 price display           | #2                 | decided — price per horse, `null` = on request                              |
| E0.3 seller identity         | #3                 | decided — per-horse kind; operator values landed in #61                     |
| E7.5 seller identity footer  | #61                | done — `operator` in `site.ts`, footer legal block, KSH art. 206 lines      |
| E0.4 X-rays                  | #4                 | decided — PDF study, public download                                        |
| E0.5 domain and mailbox      | #5                 | decided — nfrevolution.com now, hannavavilava.com at E8.1                   |
| E8.3 performance budget      | #65                | done — `npm run budget`: 4 KB JS, 1 MB images, poster LCP proxy             |
| everything else              | see the milestones | not started                                                                 |

## Decisions made along the way

- Astro 7.3.3, not 5 — that is what `npm create astro` installs now.
- Realtime Database, not Firestore (owner's call). Content is read once at build
  time, so Firestore's per-document read model bought nothing, and one JSON tree
  priced on bandwidth is the predictable number. Paths: `/horses`, `/enquiries`,
  `/subscribers`, `/site`, `/monitor`, which only the enquiry probe (#49) writes, and
  `/announced`, the horses the new-horse list (#48) has already mailed about.
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
- The grid card photo is 4:3, not the 437 × 560 portrait `HorsesGrid` first drew (E4.3).
  The owner decided it: a standing horse is about 4:3, and a portrait cover-crop cuts off
  its head and tail, the same trap as E4.2's full-bleed entry. `HorsesGrid` and
  `MobileHorsesGrid` were redrawn to match.
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
- A sold horse keeps its URL and gets a trimmed page, drawn as `HorseDetailSold` and
  `MobileDetailSold` (E2.8). The hero stays, `Sprzedana`/`Sprzedany` by sex takes the
  price's place, and the dark band links to the horses for sale with their count. Price,
  X-rays, health, viewing, videos, gallery and the enquiry for that horse are all dropped,
  because the health record belongs to the new owner just as the X-rays do. Publish
  deletes a sold horse's X-ray objects through Cloudflare's REST API (the endpoint
  `wrangler r2 object delete` uses), purges their URLs, and only then removes
  `xrays/files`. A failure leaves the database alone, so the next Publish retries. The
  admin editor `confirm()`s before saving a sold horse that still has files. The
  `CLOUDFLARE_TOKEN` secret carries R2 Edit and Zone Cache Purge. The ids are duplicated in
  `functions/index.js`, because `functions/` cannot import `src/media.ts`. The index, the
  detail page, the structured data and the sitemap did not exist yet, so #32, #33, #34, #52
  and #53 each carry the exclusion line.
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
  Functions in `europe-central2`, which is Warsaw itself (Storage moved to US-EAST1 in E2.5). The database sits in a
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
  No default project in `.firebaserc` (it holds storage targets only, E2.5): the project id already lives in the `FIREBASE_PROJECT_ID`
  repository variable and both workflows pass it explicitly. #16 did not need one either —
  the emulator runs on `--project demo-hv`, which cannot reach production by construction.
- The preview workflow skips a fork's pull request rather than failing it. The repo is public
  and a `pull_request` from a fork gets no secrets, so `FIREBASE_SERVICE_ACCOUNT` arrives empty
  and the deploy step fails every time; `vars.FIREBASE_PROJECT_ID != ''` does not catch it,
  because repository variables _are_ readable from fork pull requests and only secrets are
  withheld. The trigger stays `pull_request`, never `pull_request_target` — fork code must not
  run with secrets. Preview channel URLs are public and reachable from the bot's pull-request
  comment. What keeps them out of the index is the `noindex` on every page of a build that is
  not `site.indexable` (E6.4, #53), backed by the absolute `<link rel="canonical">` in
  `Base.astro`, which points at production (#9).
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
- The admin panel has no artboard and needs none: it is not public UI, one person uses it,
  so it is built plain on the existing tokens (E2.3). `/admin` is a standalone page rather
  than `Base.astro` — no canonical, hreflang or og tags — and stays out of `routes.ts`, so
  it has no `/en` twin. The Firebase web SDK is imported only by its bundled `<script>`;
  every other page still ships no `_astro` JS. The web config sits in `src/firebase.ts` as
  constants, because the API key is an identifier and the rules are the lock. The `admin`
  claim is set by `npm run admin:grant -- <email>` with application-default credentials, and
  the panel force-refreshes the ID token so a new claim needs no sign-out. The `-4baa3`
  authorized-domain warning on #18 was stale; `hanna-vavilava-site.web.app` was already on
  the list. Email and password sign-in is not checked against that list anyway; it works on
  preview channels too. The list matters only for OAuth or email-link sign-in.
- The horse gains `status` (`available | reserved | sold`) and `order`, both defaulted, so
  the seeded horse needed no migration (E2.4). The stock count and the featured horse read
  only `available`, in `order`. Reserved and sold horses keep their pages, and #23 owns how
  a sold one looks. The editor validates with `horseSchema` before every write, the same
  parse the build runs, so the panel cannot write a horse that fails `astro build`. The
  rules still say who and never what. Videos, photos and X-ray files are JSON textareas
  until #20 and #70 replace them.
- Photos live in Firebase Storage, not R2 (E2.5). A photo is a build input Astro re-encodes
  onto Hosting, so R2's free egress buys nothing, and Storage takes a browser upload gated by
  the `admin` claim in `storage.rules` where R2 would need a presigning Function (#70's). Keys
  are `photos/<slug>/<sha8>.jpg`, public read, admin create/update, JPEG under 10 MB, no
  delete. The panel downscales to a 2400 px long edge on an `OffscreenCanvas` and re-encodes
  JPEG, which is what drops EXIF and the GPS of the yard. A photo is `{ key, alt, caption }`:
  the boards draw the first photo as the hero and the grid card with no text, and the gallery
  photos with a short visible caption, so `alt` is required in both locales and `caption` may
  be empty. `astro.config.mjs`, `deploy.yml` and `horse.ts` had assumed R2 and were corrected.
- The photo bucket is `hanna-vavilava-site` in US-EAST1, not the Warsaw default (E2.5). The
  default `.firebasestorage.app` bucket in `europe-central2` has no free tier; a bucket in
  `us-central1`, `us-east1` or `us-west1` sits in Cloud Storage's Always Free tier, and the
  owner created one and linked it to Firebase. The Warsaw bucket is gone. Upload latency is the
  only cost, and visitors never read the bucket. The legal reading: the photos are horses with
  EXIF stripped, Google is DPF-certified with SCCs in its terms, and Firebase Auth already
  stores the admin email in the US. Consent for a recognisable rider (art. 81 of the copyright
  act) is owed wherever the bucket sits. With no default bucket, `firebase deploy --only storage`
  cannot resolve one, so `firebase.json` names the target `photos` and `.firebaserc` maps it for
  `hanna-vavilava-site` and for the emulator's `demo-hv`. `.firebaserc` holds targets only, never
  a default project. The rules deploy by hand, like the database rules:
  `npx firebase-tools@15 deploy --only storage --project hanna-vavilava-site`.
- Publish is a callable Function, `publish` in `europe-central2`, plain ESM in `functions/` with no
  build step (E2.6). It checks the `admin` claim first. Next it stamps `/site/updated` with the
  Warsaw date through the Admin SDK, then it sends `repository_dispatch: publish` with a
  fine-grained PAT held in the `PUBLISH_TOKEN` secret. The panel reads the deploy status from the
  public Actions API. The ceiling is 60 unauthenticated requests an hour per IP, and the repo must
  stay public. A status callable that uses the PAT is the upgrade. The Function deploys by hand,
  like the rules: `npx firebase-tools@15 deploy --only functions --project hanna-vavilava-site`.
- The enquiry inbox sits at the top of `/admin` and reads `/enquiries` live (E2.7). No enquiry
  can exist before E5.3, so the ticket fixed the storage contract instead of reading one:
  E5.3 writes each record with `push()` and `createdAt` (`ServerValue.TIMESTAMP`, ms), and the
  panel owns `handled` (`true` or absent). Every other key is shown raw as label and value,
  because E5.1 has not fixed the eight fields yet; Polish labels come once it has. The values
  are anonymous public input and reach the page only as `textContent`. Rows are ordered by
  date only, so a ticked row does not jump away from its checkbox. The contract is noted on #42.
- X-ray PDFs go from the browser straight to R2 on a SigV4 presigned PUT that the
  `xrayUpload` Function signs (E2.10). The Function builds the key,
  `horses/<slug>/xrays/<takenOn>-<rand8>.pdf`, so no key is ever reused under the one-year
  `immutable` cache, and it signs `Content-Type`, `Cache-Control` and
  `Content-Disposition: attachment; filename="<slug>-xray-<takenOn>.pdf"`, so the object
  cannot land without the download header. The uploaded file's own name is never used: it
  is where an owner's surname tends to sit (#3). SigV4 is `functions/presign.js` on
  `node:crypto`, tested against AWS's published example, instead of `@aws-sdk/*`. It signs
  with an R2 API token scoped to the bucket (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`),
  because `CLOUDFLARE_TOKEN` is a REST bearer token and cannot sign S3. The bucket's CORS
  rules are `r2.cors.json`, applied by hand. The panel reads every key back with a `HEAD`
  on the public host before the row exists. The rules allow `GET` as well, because
  Cloudflare's cache fetches a `HEAD` from R2 as a `GET` and R2 then sends no
  `Access-Control-Allow-Origin` for a method it does not allow. A removed file goes on Save, not on click: Save
  deletes and purges (the stored keys plus this session's uploads) minus the kept keys
  through `xrayDelete`, then writes the record, so a failed delete changes nothing and a
  retry counts a 404 as done. Cancel deletes this session's unsaved uploads. The size limit
  is 100 MiB, checked in the panel and in the Function. The size is the declared one, and
  R2 does not enforce it, because the only uploader is the admin.
- The hero video budget is 3–6 MB, not the 2.5 MB the canvas notes (E3.2). Horses moving
  on grass are the worst case for an encoder, and an ugly hero costs more than the bytes
  save. `scripts/video.mjs` caps the hero MP4 at 5 Mbps. The hero also gets a VP9 WebM;
  sales and round clips do not, because a second encode of a long clip buys little against
  H.264's universal support. HDR input is refused rather than tone-mapped, because
  Homebrew's ffmpeg has no `zscale`. The on-page "file < 2.5 MB" spec copy is placeholder,
  and E3.3 replaces that figure.
- The gallery caption shows in the lightbox, not over the thumbnail (E3.5). The boards
  centre a numbered label in each placeholder tile. On a real photo that label would need a
  scrim the boards do not draw. The figcaption `NN · caption` sits in the board's gap under
  the image box instead, and doubles as the counter. The boards draw no prev/next controls,
  so none are built. Arrow keys move, and a phone visitor closes and taps the next tile.
  With no JS, a thumbnail links to a full WebP built into `dist/`, never to the bucket.
- The gallery lightbox is one scroll-snap list, not one photo at a time (E3.7, #150). On desktop it
  scrolls vertically and below 720 px it is a horizontal swipe carousel. A × in the top-right
  corner closes it. The list takes focus on open, so the arrow keys along its axis scroll it
  natively. A small handler makes left and right page the vertical list on desktop too. The
  gallery script may not grow (owner, 2026-10-03): it is 524 B, down from 558 B, paid for
  with `on*` handler properties. Chrome's own lazy-load distance still fetches about two photos either side of
  the one opened, but never the whole set. The horse page as a whole is over 1 KB because of
  the drawer and the form scripts; that is #154.
- The photo and X-ray intake guide is a static Polish page at `/admin/poradnik`, not a shared doc
  and not a repo markdown file (E3.6). Standalone like `/admin`: `noindex`, no script, no sign-in,
  out of `routes.ts`. It is owner documentation with one reader, so its prose is inline Polish and
  deliberately outside `pl.json`/`en.json`; only the panel's link label, `admin.guideLink`, follows
  the two-file rule. The 2400 px edge and the 100 MB X-ray limit are imported from `src/photo.ts`
  and `src/media.ts`, so the guide cannot promise what the panel refuses. It tells Hanna to get the
  owner-free page 1 from the clinic, because a box drawn over a name in Markup leaves the text in
  the PDF.
- The sales and round videos play in the browser's own `<video controls preload="none">`, not
  behind a scripted poster button, and the boards' custom play glyph with "Odtwórz" under it
  gave way to the native control (E3.4). A button that swaps in `<video autoplay>` costs about
  250 B, and on the detail page the drawer (364 B) and the gallery (~600 B) already sit near the
  1 KB public-JS ceiling. `preload="none"` downloads nothing but the poster until play, from the
  first-party media host, and works with no JS. The poster is `poster=`, one WebP ≤1280 px built
  into `dist/`: eager and without a srcset, the `ponytail:` cost. Both transcripts are on the page,
  as two `<details>` with the page's language first, because the boards draw "PL / EN". The
  heading row and its recording-date meta are E4.5's (#35), and the schema has no field for them yet.
- The horses index lists every horse except a sold one, `site.horsesListed`, so a reserved horse
  stays listed and counted in the sub-bar (E4.2). The count in the header still reads `available`
  only. Entries alternate image left and image right, and every fourth has a narrower text column
  (`:nth-child(even)`, `:nth-child(4n)`), so the number of entries follows the data and not the
  board's four. The boards' full-bleed 1440 × 500 entry was dropped on the owner's review: a slot
  that wide crops a standing horse, so its head and legs are lost (canvas v24). `price: null` shows "Cena na zapytanie" in the price
  slot, and `Horses`/`MobileHorses` now draw it on entry 04 (canvas v22). Three deliberate
  deviations: the 390 sub-bar keeps "Wszystkie konie" where the board shortens it to "Konie";
  an empty stable renders "· 00" and no entries, a state no board draws; and each "Karta konia"
  link carries the horse's name, visually hidden, so a screen reader can tell them apart.
- The horse detail page is one component, `HorseDetail.astro`, for both locales and both states
  (E4.4). The price and the sale kind are fact rows: "Cena" closes the left column and
  "Sprzedaż" the right one, so each column has seven rows. `HorseDetail` and `MobileDetail`
  gained both rows (canvas v26). The X-ray link reads "Pobierz PDF · 24 MB" as #71 drew it. The
  exam date sits in a visually hidden span inside the link rather than in an `aria-label`, so the
  visible words stay part of the accessible name. The link carries
  `data-event="xray_download" data-horse`, like the homepage's `home_*` hooks, and #55 wires
  them. The other-horses row is `site.horsesListed` minus this horse, capped at the three the
  board draws. Five deliberate deviations. The hero has a `--scrim` under its text, which the
  boards do not draw; the homepage reasoning applies to a photo too. The CTA reads "Zapytaj o
  klacz Cascada" / "Zapytaj o wałacha …", because the accusative of an arbitrary name cannot be
  derived, and the boards now say so. The sub-bar's right side shows only the price: the board's
  "Ostatni start 6.09.2026" cannot be parsed out of free-text `lastStart`. At 390 the hero's CTA
  moved into the bottom bar in E4.8, as `MobileDetail` draws it. The header over the hero is the
  homepage's `overlay` variant without its status line, so it carries the same top scrim.
- Each video's heading row reads `m:ss · note`, and `note` is one bilingual free-text field on
  `videos[]`, not a recording date plus a music flag (E4.5). The boards' two rows carry different
  facts: "nagrane 12.09.2026 · bez podkładu muzycznego" on the sales video, and "jedna kamera ·
  6.09.2026, Zakrzów, 125 cm" on the round. Structured fields would express half of one of them.
  `npm run video` emits an empty note beside the transcript; the note defaults to empty, and then
  the row shows only the duration. The detail page mounts the first video of each kind and the
  gallery with every photo, the cover included because the hero crops it; each section is left
  out when empty, a state no board draws. Two deviations. At 390 the meta wraps under the h2
  rather than moving to a line under the player: `MobileDetail` drops the sales note and moves
  the round one, and one place for both is simpler. The desktop round h2's "/ Full round, no
  cuts" suffix is not built, because `MobileDetail` drops it too and the page is one language.
- The About portrait is a 3:4 column beside the bio, not the board's first 1440 × 620 band (E4.6).
  The owner decided it: the photo is portrait, and the band cut it to the rider's torso. The
  column is `min(480px, 40%)` so the bio keeps a readable measure between 721 and 1200. The
  photo is a repo asset (`src/assets/about/hanna.jpg`), not a database field. The band's count is
  `site.horsesAvailable` as a digit, where the board spells out "Cztery". At 390 the sub-bar drops
  the "od 2016" meta, because the bio's first line says the same. `MobileAbout` draws it.
- The EN 404 answers 200, not 404 (E4.9). Firebase Hosting serves only the root `404.html`, so
  `firebase.json` rewrites `/en/**` to `/en/404/index.html`, and a rewrite to a static file is a 200. Both 404 pages carry `noindex` and drop canonical, hreflang and `og:url`, so the soft 404
  never reaches the index. The upgrade is a Cloud Function on `/en/**` that sets status 404, if
  Search Console ever reports it. The page lists the horses as text rows, not photo cards; the
  language switch goes to the other locale's home. `npm run preview` serves the PL 404 for every
  miss; the EN one is at `/en/404`.
- The Questions page is six native `<details>`, all closed, with the answers in the HTML, so it needs
  no JavaScript and every answer is indexable (E4.7). The copy is `pages.faq.items[]`, which #52's
  FAQPage JSON-LD can read. The board's `<h1>` heading is an `<h2>`, because the sub-bar label is
  the page's one h1. The dark band is now `CtaBand.astro`, shared with About. `MobileFaq` is new
  (canvas v32).
- The 390 bottom bar is `MobileBar.astro` (E4.8): "Napisz na WhatsApp" and "Formularz", on
  horses, grid and a live horse detail, as `MobileHorses`, `MobileHorsesGrid` and `MobileDetail`
  draw it. A page opts in through `Page`'s `bar` prop, which carries the WhatsApp href, and the
  detail page passes the per-horse prefilled link. A sold horse, About, Questions, the 404 and the
  homepage video have no bar, as their boards draw. It is `position: sticky; bottom: 0` as the
  page's last element, not `fixed`: it parks under the footer at the end, so it covers nothing and
  needs no spacer and no JavaScript. Every route was probed at 390 × 844 with mobile emulation, and
  none scrolls sideways. The gutter stays `--gutter-mobile` (20px), where the horses, detail and 404
  boards draw 16px and About and Questions draw 20px.
- `Base.astro` is the head component (E6.1). No `Head.astro` was split out: every public page
  already reaches it through `Page.astro`. A horse page's description is its `headline`, not the
  index blurb. `npm run links` now checks the head of every indexable page: one title, one
  description, one canonical that is in its own hreflang set, and matching return tags on every
  twin. It is regex like the link pass. `og:image` and the `image` prop arrive with E6.2 (#51),
  and a default share card for the other pages is not designed yet.
- The link preview card is the cover photo only, centre-cropped by Astro's own sharp to a
  1200 × 630 JPEG at quality 80 (E6.2). The owner chose it over a designed card with the name
  and price on it: WhatsApp prints og:title beside the image, and the hero boards draw a clean
  photo with its text in HTML, so no board was added. sharp never upscales, so a cover under
  1200 × 630 gets a smaller card of the same shape, and the size tags say what was built.
  `npm run links` fails any og:image over 300 000 bytes or not on HTTPS. The CI fixture has no
  photos, so the gate bites on the preview and deploy builds, and `preview.yml` now runs it.
- Structured data is one `JsonLd.astro` per block, in the body of the page that owns it (E6.3):
  LocalBusiness on both home pages under one `@id`, the Polish home, which each Offer names as
  seller. BreadcrumbList on every horse page, Product with Offer only for a priced unsold horse,
  because a Product without an Offer is as invalid as an Offer without a price. VideoObject per
  video, with `uploadDate` from the R2 object's `Last-Modified`: keys are content-addressed and
  never overwritten. FAQPage from `pages.faq.items`. `npm run links` parses every block and
  fails a Product without an Offer or an Offer without a price. The address is `addressCountry`
  only until the registered seller details land.
- The horse page's enquiry is `EnquiryForm` with `horse` and `dark` (E5.2): the page's one
  inverted band after Viewing, with the horse preselected and its label reading "Koń — wybrany".
  A sold horse gets no form. At 390 the whole form is inline, in one column. `MobileDetail`
  drew a teaser that linked to the enquiry page, but carrying the horse to another page needs
  a script, so the owner chose the inline form (canvas v38). The bottom bar's "Formularz" on a
  horse page goes to `#enquiry` through `Page`'s `barForm`. The heading reads "Zapytanie o
  klacz Cascada" / "o wałacha …" for the same reason as the CTA: the board's "o Cascadę" needs
  an accusative. The inverted field rule is `--rule-field-inv` `#807f7d`, the board's 50%
  `--ink-inv`, which is checked at 3:1. The enquiry page's search form, "Szukają Państwo czegoś
  innego?", posts `kind=search` with five optional free-text fields and a **required WhatsApp
  number**. The board drew no contact field, and Hanna could not have replied. The owner added
  it, so the grid is 3 × 2 where the board drew five in a row. Its lead count is
  `site.horsesListed` as a digit, where the board spells out "Cztery".
- Turnstile is the one exception to the 1 KB public-JS budget (E5.6). Our own inline JS stays
  under it, at 956 bytes on a horse page with the Telegram fields. Cloudflare's `api.js` is appended only the first time
  a visitor focuses a field of a form, so browsing a horse page loads nothing third-party. The
  widget runs in the Invisible mode and draws nothing. Without JavaScript there is no token and
  `submitEnquiry` writes nothing. A `<noscript>` line above the actions sends the buyer to
  WhatsApp, and the boards draw it behind a `noJs` tweak (canvas v39).
- The rate limit against a forged address is a global cap, not a better guess at the address
  (E5.6). Anyone calling the direct function URL can set `fastly-client-ip`, and no documented
  contract says which `X-Forwarded-For` entry Google's front end adds. So on top of 5 posts per
  address an hour, `submitEnquiry` takes at most 20 verified posts an hour overall. It counts
  only posts that passed Turnstile, so tokenless junk cannot use the cap up and lock buyers
  out. The upgrade is a counter in the database.
- Every refusal and failure of `submitEnquiry` is a 303 to a static not-sent page (E5.7): a
  parse failure, no Turnstile token, either rate limit, or both sinks down. The pages are
  `/zapytanie/niewyslane` and `/en/enquiry/not-sent`, and they put WhatsApp first. Before this
  the buyer got a bare English text body. The HTTP status is lost, and nobody read it: #49
  watches `logger.error`. A 405 for a non-POST stays plain. The typed fields are not kept.
  Keeping them needs a `fetch` submit, and the horse page's inline JS is already at 956 of
  1024 bytes.
- The sent page reads the stored number back from the redirect's fragment,
  `/zapytanie/wyslane#+48600123456` (E5.7). A fragment never reaches a server log or a
  referrer. A query string would reach both. An inline script shows the number only if it is
  `+` and digits, and only as `textContent`. There is no length cap, because a number of the wrong
  length is exactly what the line is there to catch. A trapped bot's bare redirect hides the
  line. The board's sub-bar timestamp "19.09.2026, 14:07" is not built, because a static
  page has no send time, and a reload would show the wrong one. The label sits in the
  sub-bar as every page's h1. `Confirmation` and the new `MobileConfirmation` draw both
  states behind a `failed` tweak (canvas v42). Both pages are `noindex`.
- Only the live deploy on the real domain may be indexed (E6.4). `site.indexable` is true when
  `deploy.yml` sets `HOSTING_CHANNEL=live` and the `SITE_URL` host is not `.web.app` or
  `.firebaseapp.com`. It fails closed: preview, CI and local builds are never indexable, and #63
  changing `SITE_URL` turns indexing on with no second switch to remember. A build that is not
  indexable puts `noindex` on every page and keeps the rest of the head. Its robots.txt keeps
  `Disallow: /admin` and drops only the `Sitemap:` line. The owner chose this over the
  `Disallow: /` that #53's comment asked for, because a crawler cannot read a `noindex` on a
  page robots.txt blocks. The sitemap is our own endpoint and not `@astrojs/sitemap`, whose
  filter sees only URLs and so cannot tell that a horse is sold. Each locale gets its own
  `<url>` with pl, en and x-default alternates, the same set the head names. It leaves out the
  menu, the enquiry result pages and sold horses (`horsesListed`), and `npm run links` checks
  that every URL in it is a built page with a canonical. The link check's head pass now skips a
  page only when it has `noindex` and no canonical, because otherwise the site-wide `noindex`
  would turn it off on every CI build. Search Console and Bing are #63's job: a Domain property
  verified by DNS TXT, then Bing imported from Search Console.
- The icon set is the owner's own logo (E6.5, #54): a laurel wreath around a horse and rider
  clearing a jump, in `#F2F1ED` on a `#0E0E0D` square. It replaced the HV monogram we had first
  chosen. The favicon (32 px, SVG and ICO) is `src/assets/logo-mark.svg`: the same paths with the
  wreath removed and cropped to the horse, because at 32 px the wreath is noise. Every size is
  rasterised at build time by `src/pages/[icon].ts` from the two SVGs, so no binary is committed.
  The ICO is a 22-byte header around the 32 px PNG. The manifest is an endpoint, so the name comes
  from i18n, and it uses `display: browser`, so a sales site keeps its address bar. `sharp` is now
  declared in `package.json`, because the endpoint imports it directly. The header keeps the text
  wordmark the boards draw; the logo appears only as icons. The `Icons` board on the canvas draws the set.
- One date format and one currency display for both languages (E7.2): `19.09.2026` and the ISO
  code, `EUR 32,000` / `32 000 EUR`, as the EN and PL boards write them and as the EN budget
  options already did. The starts sync's EN `lastStart` follows, so a detail page never mixes
  `12 Sep 2026` with `19.09.2026`. The admin panel stays Polish; its English half is the content,
  and Save refuses a PL/EN pair with one half blank (`halfPairs`). It is not a schema rule, so a
  stored horse with a half pair still builds.
- Analytics is Umami Cloud on the free Hobby plan, EU region (E6.6, #55). It sets no
  cookies and needs no consent banner, it records custom events with data, and it reports a
  bounce rate. The owner wanted it free. Cloudflare Web Analytics, which #1 and #69 assumed in
  passing, was ruled out as the original plan had ruled it out: it records pageviews only,
  with no custom events and no bounce rate, it is not EU-hosted, and Hanna's KPIs are events.
  Firebase Analytics, which is GA4, was ruled out when the owner asked on 2026-10-03. Its
  `_ga` cookie needs consent under ePrivacy art. 5(3) whether or not the data is personal, so
  it brings the banner over the hero. A reject button as prominent as accept, which the Polish
  regulator expects, then loses exactly the visitors `xray_download` exists to catch. It is
  also about 100 KB of JS. The US transfer itself would be lawful under the Data Privacy
  Framework; that was never the obstacle.
  Umami's own `script.js` was ruled out too. It is about 2 KB of third-party code, and its
  `data-umami-event` attribute covers only clicks.
  The beacon is one hand-minified inline script in `Base.astro`. It posts what Umami's tracker
  posts to `https://gateway.umami.is/api/send`, the collect host since 2026-06-06. It renders
  only when `HOSTING_CHANNEL` is `live` and `umami.website` is set, so previews and CI send
  nothing. The page URL it sends never includes the hash, because the sent page's hash is the
  buyer's phone number. Event names:
  - `data-event` on a link, form or `<video>`. The element's other `data-*` attributes become
    the event's data. On a horse page every event also carries `horse`.
  - `whatsapp_click` and `telegram_click`, taken from the link's host, so a new link is
    tracked without any markup.
  - `horse_view`, `enquiry_success` and `enquiry_failure`, sent from the page itself.
  - Homepage bounce is Umami's bounce rate on the `/` and `/en` entry pages.
- The analytics beacon is the one exception to the 1 KB public-JS budget, and the owner
  accepted it (E6.6). It is 815 B raw and about 515 B gzipped, measured on the live build.
  With it, the homepage carries 1 658 B of inline JS, the horse page 1 845 B and the enquiry
  page 1 840 B. Without it they carry 843, 1 025 and 1 025 B. Ad-blocked visitors are not
  counted; the `ponytail:` upgrade is a forwarding Function.
- Campaign attribution happens in Umami, not in the enquiry (E6.7, #56). The tagging rules are
  in `README.md` under Campaign links. The beacon already sends the landing page's query string.
  Umami's Attribution report links a session's `utm_*` to `enquiry_success`, `whatsapp_click`
  and `telegram_click`. The enquiry Hanna receives does not say where the buyer came from.
  Doing that would mean carrying the tags in JS from the landing page to the form, on pages
  already over budget, and it would still miss WhatsApp and Telegram clicks.
  `ponytail:` add it if Hanna asks for the source in each message.
- The footer names the operator as `CEWET TAS sp. z o.o.`, not the registered
  `CEWET TAS SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ`: KSH art. 160 §1 allows the
  abbreviation. REGON is the 9-digit entity number; the KRS prints the 14-digit
  main-unit form. Registry court and share capital are shown because KSH art. 206 §1
  requires them on a sp. z o.o.'s website (#61). The homepage and menu have no
  footer by design (#13), so the legal block is one click away there.
- The public JavaScript budget is 4 KB of a page's own inline JS, not 1 KB (E4.13, #154). The
  1 KB figure had no source: the scaffold shipped 364 B and the line in `AGENTS.md` rounded it
  up. No ticket, comment or the Astro docs give a reason for it, and Astro sets no limit of its
  own. Its one size number is Vite's `build.assetsInlineLimit`, 4 KB by default, past which a
  processed `<script>` stops being inlined and costs a request of its own; that is the new
  ceiling. The rules that carry the weight stay: no framework, no hydrated islands, every
  public page works without JavaScript. The analytics beacon now fits inside the budget and
  is no longer an exception: a horse page with photos carries about 1.4 KB plus the 821 B
  beacon. Turnstile's `api.js` stays the one exception, because it is third-party and loads
  only on a form's first focus. The E6.6 and E5.6 lines above describe the old 1 KB budget.
- The performance budget is enforced by `scripts/check-budget.mjs` (E8.3, #65), in `npm run ci`
  and after the preview and deploy builds, which have real photos and the real beacon. The JS
  count includes inline scripts plus any `/_astro/*.js` Astro split out, with `ld+json` skipped.
  A build without the beacon reserves 1 KB for it. Images are capped at 1 MB per page, counting
  each non-lazy `<img>` at its largest candidate. Lazy gallery photos are not counted, because
  they load when the dialog opens. Poster LCP under 1 s is checked by a proxy, not measured:
  the homepage poster must be `fetchpriority="high"` and not lazy, and its smallest candidate
  must be at most 120 KB. It was 66 KB at the time of this change. Lighthouse CI is the upgrade
  if the proxy lets a slow poster through.
- The enquiry inbox moved to `/admin/zapytania` (E2.14, #158); `/admin` keeps only a live count of
  unhandled enquiries and a link, so the list no longer pushes the horse editor down. Both read
  `handled` through `isHandled` in `src/enquiry.ts`, so a record with no flag counts as
  unhandled in both. The inbox has no sign-in form of its own: a signed-out or non-admin visit is
  sent to `/admin`, which loses a deep link after sign-in. A shared gate is the upgrade. The E2.7
  line above describes the old placement.
- The Google map on the about page is a plain lazy iframe (E4.16, #165). It loads as the visitor
  scrolls to it, so Google gets the IP address and may set its own cookies without a consent
  step. A click-to-load placeholder was built first and the owner rejected it on sight: the map
  shown at once is worth more to a buyer than the gate. The notice names Google, the IP, the
  cookies, legitimate interest and the DPF transfer. This sits against the GA4 reasoning above
  (cookies need consent under ePrivacy art. 5(3)); if a regulator or a complaint ever presses
  it, the click-to-load `srcdoc` version is in the history of #175. The Privacy boards carry the
  notice word for word, so any privacy copy change edits them too.
- The horse detail page is media first (E4.20, #179): videos in one CSS scroll-snap strip of any
  number of titled clips, then the gallery, then one free `description`. The site was not live,
  so the owner chose no migration path: the live `/horses` was rewritten in place once and the
  schema stays strict on the new shape. Once the site is live, a schema change that breaks a
  stored horse breaks every open pull request's preview and Publish on main until the database
  matches, so it needs a read-time upgrade or an additive step instead.
- Preview (E2.15, #184) builds the saved database to one Hosting channel `draft`, through
  `draft.yml` and its own concurrency group. It does none of Publish's jobs: no
  `/site/updated` stamp, no sold-X-ray delete, no announcement, never live. The channel URL
  ends in a hash Firebase picks, and it picks a new one after the 30-day expiry. So the URL lives
  on the `draft` GitHub environment's deployment, which the admin reads after the run. It does
  not live in `src/site.ts`.
- A form posted from any Hosting channel (E2.15) is a test. That covers the `draft` preview and
  every pull request's channel. `submitEnquiry` and the notify signup treat it as the honeypot:
  the sent page, with nothing stored, mailed or messaged. They recognise a channel by `--` in
  `Origin` or `X-Forwarded-Host`. Before this, a test enquiry from a PR preview reached Hanna.
