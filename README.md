# hanna-vavilava-site

Sales site for Hanna Vavilava — show jumping horses near Warsaw.

## Run it

    npm install
    npm run dev       # http://localhost:4321
    npm run ci        # format check, types, build, internal link check

## Routes

Polish is the default locale and sits at the root; English sits under `/en`.
Paths are localised (`/konie`, `/en/horses`) and defined once in
`src/i18n/routes.ts`.

| Page                  | PL                   | EN                  |
| --------------------- | -------------------- | ------------------- |
| Home                  | `/`                  | `/en`               |
| Menu (no-JS fallback) | `/menu`              | `/en/menu`          |
| Horses                | `/konie`             | `/en/horses`        |
| Horses, grid          | `/konie/siatka`      | `/en/horses/grid`   |
| Horse                 | `/konie/<slug>`      | `/en/horses/<slug>` |
| About                 | `/o-mnie`            | `/en/about`         |
| Questions             | `/pytania`           | `/en/questions`     |
| Enquiry               | `/zapytanie`         | `/en/enquiry`       |
| Enquiry sent          | `/zapytanie/wyslane` | `/en/enquiry/sent`  |
| Privacy               | `/prywatnosc`        | `/en/privacy`       |

## Deployment

GitHub Actions builds the site and deploys it to Firebase Hosting, on a push to
`main` and on the `repository_dispatch` the admin panel's Publish button sends.
Pull requests get their own preview channel.

Repository settings the workflows expect:

| Kind     | Name                       | What it is                                                                                 |
| -------- | -------------------------- | ------------------------------------------------------------------------------------------ |
| Variable | `FIREBASE_PROJECT_ID`      | The Firebase project                                                                       |
| Variable | `SITE_URL`                 | Canonical origin: the Firebase `.web.app` URL until E8.1, then `https://hannavavilava.com` |
| Secret   | `FIREBASE_SERVICE_ACCOUNT` | Service account JSON: Hosting deploy + database read                                       |

## Campaign links

Every link posted outside the site carries UTM tags, so Umami can tell which post or ad
brought an enquiry (E6.7). The analytics beacon sends the page's query string, and that is all
it takes. There is nothing to configure.

Tags are lowercase, words joined with hyphens, no spaces. `utm_source`, `utm_medium` and
`utm_campaign` are always set. `utm_content` is optional and tells two versions of one ad apart.

| Tag            | Means                       | Values                                                                               |
| -------------- | --------------------------- | ------------------------------------------------------------------------------------ |
| `utm_source`   | where the click happens     | `instagram`, `facebook`, `meta` (one ad on both), `google`, `whatsapp`, `email`      |
| `utm_medium`   | what kind of link it is     | `bio`, `story`, `post`, `dm`, `paid`, `email`                                        |
| `utm_campaign` | why the link exists         | `profile` for the bio link, a horse's slug, `YYYY-MM-<name>` for anything time-boxed |
| `utm_content`  | which version, if there are | `video`, `photo`, `a`, `b`                                                           |

Link to `/`, `/en` or a horse page from the Routes table, never with a trailing slash:
Hosting redirects `/en/` to `/en`. Give each ad fixed values. Meta's `{{site_source_name}}`
gives `ig` and `fb`, and those break the list above.

    # Instagram bio link
    https://hanna-vavilava-site.web.app/?utm_source=instagram&utm_medium=bio&utm_campaign=profile
    # A paid ad for one horse, shown on Instagram and Facebook
    https://hanna-vavilava-site.web.app/en/horses/<slug>?utm_source=meta&utm_medium=paid&utm_campaign=<slug>

When the site moves to `https://hannavavilava.com` (E8.1), change the host in the bio link and
in every live ad.

In Umami, the UTM report counts visits per tag. The Attribution report shows which tags led to
enquiries. Set its conversion to the event `enquiry_success`, `whatsapp_click` or
`telegram_click`. The enquiry Hanna receives does not name its source.

## Media

Video, posters and X-ray PDFs live in the Cloudflare R2 bucket `hanna-vavilava-media`,
served from `https://hv-media.nfrevolution.com` until E8.1. The values sit in
`media` in `src/media.ts`. Uploads need `npx wrangler@4 login` once, and every
object carries the long immutable `Cache-Control`, so a key is never overwritten:

    npx wrangler@4 r2 object put hanna-vavilava-media/<key> --file <file> --remote \
      --cache-control "public, max-age=31536000, immutable"

Video goes through `scripts/video.mjs`, never the admin panel. It needs ffmpeg. The script
encodes the clip, cuts the poster, uploads everything this way, and prints the JSON to paste:

    npm run video -- <file> hero                  # homepage loop: MP4 + WebM + poster
    npm run video -- <file> sales|round <slug>    # a horse's clip: MP4 + poster

The hero's JSON replaces `hero` in `src/media.ts`, and a rebuild puts it on the homepage.
A horse's clip goes into its Videos in the admin.

A sold horse's X-rays are deleted and purged from the edge by Publish (E2.8). The
Function's `CLOUDFLARE_TOKEN` secret is a Cloudflare API token with Account · Workers
R2 Storage · Edit and Zone · Cache Purge on `nfrevolution.com`.

## Still placeholder

Every contact detail, the stable name, the horse facts and the video assets are
invented and marked `PLACEHOLDER` in the source. Grep for it before launch.
