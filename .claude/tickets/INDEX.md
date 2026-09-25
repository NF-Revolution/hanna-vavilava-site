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
| E2.3 admin shell             | #18                | done — `/admin`, Firebase Auth, `npm run admin:grant`         |
| E2.4 admin horse editor      | #19                | done — list, reorder, status, every field PL/EN               |
| E2.5 admin photo upload      | #20                | done — Storage, 2400 px, EXIF stripped, alt required          |
| E2.6 publish button          | #21                | done — `functions/` `publish`, live in `europe-central2`      |
| E2.7 admin enquiry inbox     | #22                | done — `/admin` lists `/enquiries`, ticks `handled`           |
| E2.8 sold-horse handling     | #23                | done — trimmed sold page, Publish deletes and purges X-rays   |
| E2.9 seed real horses        | #24                | done — 2 horses, invented facts, unpublished; rest in #91     |
| E2.10 X-ray PDF upload       | #70                | done — presigned PUT to R2, owner tick, Save deletes + purges |
| E3.1 responsive picture      | #25                | done — `Photo.astro`, size inferred at build, CI checks size  |
| E3.5 gallery lightbox        | #29                | done — `Gallery.astro`, unmounted until E4.5 (#35)            |
| E3.6 photo intake guide      | #30                | done — `/admin/poradnik`, Polish, limits imported from code   |
| E3.3 hero player             | #27                | done — gated `<video>`, keys in `src/media.ts`, still `null`  |
| E3.4 sales video facade      | #28                | done — `Video.astro`, native player, unmounted until E4.5     |
| E4.1 homepage                | #31                | done — fixed viewport, MobileHome two bars                    |
| E4.2 horses index, editorial | #32                | done — `HorsesIndex.astro`, `site.horsesListed`, canvas v24   |
| E4.4 horse detail page       | #34                | done — `HorseDetail.astro`, price and sale rows, canvas v26   |
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
  on the public host before the row exists. A removed file goes on Save, not on click: Save
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
  slot, and `Horses`/`MobileHorses` now draw it on entry 04 (canvas v22). Four deliberate
  deviations: the price is `formatPrice`'s `32 000 €`, as on the homepage, where the board writes
  `32 000 EUR`; the 390 sub-bar keeps "Wszystkie konie" where the board shortens it to "Konie";
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
  "Ostatni start 6.09.2026" cannot be parsed out of free-text `lastStart`. At 390 the hero keeps
  the CTA the board moves into a sticky bar, because the bar is #38's and #47's and the page
  would otherwise have no WhatsApp button but the header icon. The header over the hero is the
  homepage's `overlay` variant without its status line, so it carries the same top scrim.
