/*
 * Internal link check over dist/. Catches a localised path that drifted from
 * the route table — the failure this site is most prone to, because every page
 * exists twice under different names.
 *
 * Then the head (E6.1): the canonical and hreflang URLs are absolute, so the
 * pass above never sees them. Every indexable page has one title, one
 * description and one canonical inside its own hreflang set, and every twin
 * it names exists and names the same set back.
 *
 * Then the link preview cards (E6.2): every og:image is absolute HTTPS, is in
 * dist/, and is under the ~300 KB WhatsApp silently drops. The CI fixture has
 * no photos, so this bites on the preview and deploy builds, which read live data.
 *
 * Then the structured data (E6.3): every JSON-LD block parses, every Product has
 * an Offer and every Offer a price and a currency, because Search Console reports
 * either one missing as an error. The fixture's priced horse carries an Offer.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : extname(full) === '.html' ? [full] : [];
  });
}

const pages = walk(DIST);
const broken = [];

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const path = href.split('#')[0].split('?')[0];
    if (!path || extname(path)) {
      if (path && !existsSync(join(DIST, path))) broken.push(`${page} -> ${href}`);
      continue;
    }
    const target = join(DIST, path, 'index.html');
    if (!existsSync(target)) broken.push(`${page} -> ${href}`);
  }
}

const pageOf = (href) => join(DIST, new URL(href).pathname, 'index.html');
const alternatesOf = (html) =>
  [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
    .map(([, lang, href]) => `${lang} ${href}`)
    .sort()
    .join(', ');

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  if (html.includes('name="robots" content="noindex')) continue;
  const count = (re) => html.match(re)?.length ?? 0;
  if (count(/<title>/g) !== 1) broken.push(`${page}: not exactly one <title>`);
  if (count(/<meta name="description"/g) !== 1) broken.push(`${page}: not exactly one description`);
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
  if (canonicals.length !== 1) broken.push(`${page}: not exactly one canonical`);
  const own = alternatesOf(html);
  const twins = [...html.matchAll(/hreflang="[^"]+" href="([^"]+)"/g)].map(([, href]) => href);
  if (canonicals[0] && !twins.includes(canonicals[0][1]))
    broken.push(`${page}: canonical not among its hreflang links`);
  for (const href of twins) {
    const twin = pageOf(href);
    if (!existsSync(twin)) broken.push(`${page} -> hreflang ${href}`);
    else if (alternatesOf(readFileSync(twin, 'utf8')) !== own)
      broken.push(`${page} -> hreflang ${href}: return tags differ`);
  }
}

const CARD_BYTES = 300_000;
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const [, src] of html.matchAll(/property="og:image" content="([^"]+)"/g)) {
    if (!src.startsWith('https://')) broken.push(`${page}: og:image not absolute HTTPS: ${src}`);
    const file = join(DIST, new URL(src, 'https://x').pathname);
    if (!existsSync(file)) broken.push(`${page} -> og:image ${src}`);
    else if (statSync(file).size > CARD_BYTES)
      broken.push(`${page}: og:image is ${statSync(file).size} bytes, over ${CARD_BYTES}`);
  }
}

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    let data;
    try {
      data = JSON.parse(json);
    } catch {
      broken.push(`${page}: JSON-LD does not parse`);
      continue;
    }
    if (data['@type'] === 'Product' && !data.offers) broken.push(`${page}: Product without Offer`);
    const offer = data.offers;
    if (offer && !(typeof offer.price === 'number' && offer.priceCurrency))
      broken.push(`${page}: Offer without price or currency`);
  }
}

if (broken.length) {
  console.error(`${broken.length} broken internal link(s) or head tag(s):`);
  for (const line of broken) console.error(`  ${line}`);
  process.exit(1);
}
console.log(`${pages.length} pages, no broken internal links, hreflang reciprocal`);
