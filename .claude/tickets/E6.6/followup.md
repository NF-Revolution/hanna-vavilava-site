# E6.6 · Analytics and custom events (#55)

Finalized 2026-10-03.

## 2026-10-03

- Approach agreed and posted on #55. Provider: Umami Cloud Hobby, EU region (free).
- Collect endpoint read from the live `script.js`: `https://gateway.umami.is/api/send`.
  A fake ID gets `400 {"error":"Invalid website ID"}`, and CORS is `*`.
- Built, `npm run ci` green, independent review clear.

## What was built — 2026-10-03

- `src/site.ts`: `umami = { endpoint, website }`, with `website` set to `''` and marked
  PLACEHOLDER. `analytics` is true only when `HOSTING_CHANNEL === 'live'` and a website ID
  is set.
- `src/layouts/Base.astro`: one hand-minified inline beacon, built as a `String.raw` and
  placed with `set:html`, the way the sent page's echo is. It is wrapped in an IIFE so its
  names never collide with the top-level `const n` in that echo. It:
  - sends a pageview on load, then `horse_view` on a horse page and
    `enquiry_success` / `enquiry_failure` on the sent and not-sent pages;
  - uses capture-phase `click` on `<a>`. A link's `data-event` gives the name; otherwise
    its host does, with `wa.me` giving `whatsapp_click` and `t.me` giving
    `telegram_click`;
  - uses capture-phase `submit` on forms that carry `data-event`;
  - uses capture-phase `play` on a `<video data-event>`, once: the attribute is deleted
    after it sends.
    The element's other `data-*` attributes become the event's data, and `horse` is merged
    in on a horse page. `url` is `pathname + search` and never includes the hash.
- Hooks: `enquiry_submit` with `form: enquiry | search` (`EnquiryForm`, `EnquiryPage`),
  `view_switch` with `view: editorial | grid` (`ViewSwitch`), and `video_play` with
  `video: <kind>` (`Video`). The `home_*` and `xray_download` hooks already existed.
- Homepage bounce needs no code. It is Umami's bounce rate on the entry pages `/` and `/en`.

## Outcome — 2026-10-03

Shipped as planned, apart from the beacon's size. Formatted by prettier, the `define:vars`
version came to 1 616 B. Hand-minified it is 815 B raw and about 515 B gzipped. The owner
accepted it as the one exception to the 1 KB budget, and the measured bytes are logged in
`.claude/tickets/INDEX.md`.

Traps for next time:

- **Nothing is recorded yet.** The website ID is `''` until the owner creates the Umami
  Cloud site in the EU region. After that it is a one-line change in `src/site.ts` and a
  redeploy.
- Umami moved its collect host to `gateway.umami.is` on 2026-06-06. If the events stop,
  check the current `script.js` for the host it builds.
- The CI fixture has no X-rays and no videos, so `xray_download` and `video_play` never
  render in `npm run ci`. They were checked with a Node simulation against a live-mode build
  (`HOSTING_CHANNEL=live` and a test ID).
- A click anywhere inside a form must never send `enquiry_submit`. That is why the click
  listener matches only `closest('a')`, while forms and videos have their own listeners.
- To see event data in Umami, use the Events view. `horse`, `form`, `view` and `video` are
  the properties.
