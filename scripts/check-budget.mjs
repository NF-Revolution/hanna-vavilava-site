/*
 * The performance budget, as assertions over dist/ (E8.3). Three per public page:
 * its own JavaScript, the images it loads up front, and on the homepage a proxy
 * for the poster's LCP. Runs in `npm run ci` on the fixture, and in the preview and
 * deploy builds on real photos and the real beacon, before they deploy.
 *
 * ponytail: regex over built HTML, no headless browser, like check-a11y.mjs.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative, sep } from 'node:path';

const DIST = 'dist';
const KB = 1024;

/* Vite's `assetsInlineLimit`, past which Astro gives a script a request of its own (#154). */
const JS_BUDGET = 4 * KB;
/*
 * ponytail: the analytics beacon renders only on a live build, so any other build
 * reserves room for it — 821 B plus a horse slug. Re-measure if the beacon grows.
 */
const BEACON_RESERVE = 1 * KB;
const IMAGE_BUDGET = 1024 * KB;
/*
 * ponytail: a proxy for poster LCP under 1 s — the 640w jpg arriving in about a
 * second on slow 4G. The jpg is the worst case; avif is smaller. Lighthouse CI
 * asserting LCP itself is the upgrade if this ever passes a slow poster.
 */
const POSTER_BUDGET = 120 * KB;
const HOMEPAGES = ['index.html', join('en', 'index.html')];

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : extname(full) === '.html' ? [full] : [];
  });

/* Size of a built asset by its URL path, or null when it is not in dist/. */
const sizeOf = (url) => {
  const file = join(DIST, decodeURI(url.split(/[?#]/)[0]));
  return url.startsWith('/') && existsSync(file) ? statSync(file).size : null;
};

const fmt = (bytes) => `${(bytes / KB).toFixed(1)} KB`;

function scriptBytes(html) {
  let bytes = 0;
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    // Data, not script (E6.3).
    if (/\stype\s*=\s*"application\/ld\+json"/.test(attrs)) continue;
    const src = attrs.match(/\ssrc\s*=\s*"([^"]+)"/)?.[1];
    // A src outside dist/ is third-party; Turnstile's api.js is not even in the HTML.
    bytes += src ? (sizeOf(src) ?? 0) : Buffer.byteLength(body);
  }
  if (!html.includes('x-umami-website-id')) bytes += BEACON_RESERVE;
  return bytes;
}

/* Every candidate size of one <img>, from src and srcset. */
const candidates = (attrs) =>
  [...attrs.matchAll(/(?:\ssrc\s*=\s*"|,\s*|srcset\s*=\s*")(\/[^\s",]+)/g)]
    .map(([, url]) => sizeOf(url))
    .filter((size) => size !== null);

function checkPage(file, failures) {
  const html = readFileSync(file, 'utf8');
  const page = relative(DIST, file);
  const fail = (message) => failures.push(`${relative('.', file)}: ${message}`);

  const js = scriptBytes(html);
  if (js > JS_BUDGET) fail(`${fmt(js)} of JavaScript, budget ${fmt(JS_BUDGET)}`);

  let images = 0;
  for (const [, attrs] of html.matchAll(/<img\b([^>]*)>/g)) {
    // Lazy images load when scrolled to or when the gallery opens, not up front.
    if (/\sloading\s*=\s*"lazy"/.test(attrs)) continue;
    images += Math.max(0, ...candidates(attrs));
  }
  if (images > IMAGE_BUDGET) fail(`${fmt(images)} of images up front, budget ${fmt(IMAGE_BUDGET)}`);

  if (HOMEPAGES.includes(page)) {
    const poster = html.match(/<img\b([^>]*\sfetchpriority\s*=\s*"high"[^>]*)>/)?.[1];
    if (!poster) fail('poster <img> has no fetchpriority="high"');
    else {
      if (/\sloading\s*=\s*"lazy"/.test(poster)) fail('poster <img> is lazy');
      const smallest = Math.min(...candidates(poster));
      if (!(smallest <= POSTER_BUDGET)) {
        fail(`poster's smallest candidate is ${fmt(smallest)}, budget ${fmt(POSTER_BUDGET)}`);
      }
    }
  }
  return { page, js, images };
}

/* ---- run ---- */

const failures = [];
// The admin panel is the one client-rendered route, outside the public budget.
const pages = walk(DIST).filter((file) => !relative(DIST, file).startsWith(`admin${sep}`));
const results = pages.map((page) => checkPage(page, failures));

if (failures.length) {
  console.error(`${failures.length} budget failure(s):`);
  for (const line of failures) console.error(`  ${line}`);
  process.exit(1);
}
const worst = (key) => results.reduce((a, b) => (b[key] > a[key] ? b : a));
console.log(
  `${pages.length} pages within budget — most JS ${fmt(worst('js').js)} (${worst('js').page}), ` +
    `most images ${fmt(worst('images').images)} (${worst('images').page})`,
);
