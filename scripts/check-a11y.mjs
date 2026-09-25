/*
 * The accessibility baseline, as assertions (E1.10). Two halves: the contrast
 * maths over src/styles/tokens.css, and a structural pass over dist/.
 *
 * ponytail: regex and arithmetic, no dependency and no headless browser. It
 * checks the handful of rules this site keeps breaking, not the whole of WCAG
 * — axe-core behind a real browser is the upgrade if that stops being enough.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const DIST = 'dist';
const TOKENS = 'src/styles/tokens.css';

/* ---- contrast ---- */

const channel = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

function luminance([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map((v) => channel(v / 255));
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) return { rgb: [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)), alpha: 1 };
  const rgba = value.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i,
  );
  if (rgba)
    return {
      rgb: rgba.slice(1, 4).map(Number),
      alpha: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  return null;
}

/* A scrim's worst case is the brightest frame the video can show. */
const overWhite = ({ rgb, alpha }) => rgb.map((c) => Math.round(255 * (1 - alpha) + c * alpha));

/*
 * What each token is for. The stylesheet cannot say this, so it is said here:
 * text pairs at 4.5:1 (SC 1.4.3), the form-field rule at 3:1 (SC 1.4.11), and
 * each scrim carrying the inks that are allowed to sit on it over video.
 */
const TEXT_PAIRS = [
  ['--ink', '--ground-light'],
  ['--ink-muted', '--ground-light'],
  ['--ink-inv', '--ground-dark'],
  ['--ink-inv-muted', '--ground-dark'],
  ['--ink-inv-faint', '--ground-dark'],
];
const UI_PAIRS = [['--rule-field', '--ground-light']];
const SCRIMS = [
  ['--scrim', ['--ink-inv']],
  ['--scrim-strong', ['--ink-inv', '--ink-inv-muted']],
];

function checkTokens(failures) {
  const css = readFileSync(TOKENS, 'utf8');
  const tokens = new Map();
  for (const [, name, value] of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const color = parseColor(value.trim());
    if (color) tokens.set(name, color);
  }

  const get = (name) => {
    const color = tokens.get(name);
    if (!color) failures.push(`${TOKENS}: ${name} is missing or not a colour`);
    return color;
  };

  const assert = (ink, ground, floor, label) => {
    const [a, b] = [get(ink), get(ground)];
    if (!a || !b) return;
    const ratio = contrast(a.rgb, b.alpha === 1 ? b.rgb : overWhite(b));
    if (ratio < floor) {
      failures.push(
        `${TOKENS}: ${ink} on ${label ?? ground} is ${ratio.toFixed(2)}:1, needs ${floor}:1`,
      );
    }
  };

  for (const [ink, ground] of TEXT_PAIRS) assert(ink, ground, 4.5);
  for (const [ink, ground] of UI_PAIRS) assert(ink, ground, 3);
  for (const [scrim, inks] of SCRIMS) {
    for (const ink of inks) assert(ink, scrim, 4.5, `${scrim} over a white video frame`);
  }
}

/* ---- built pages ---- */

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : extname(full) === '.html' ? [full] : [];
  });

const text = (html) => html.replace(/<[^>]*>/g, '').replace(/\s|&nbsp;/g, '');
const named = (attrs) => /\saria-label(ledby)?\s*=\s*"[^"]+"/.test(attrs);

function checkPage(file, failures) {
  const html = readFileSync(file, 'utf8');
  const fail = (message) => failures.push(`${relative('.', file)}: ${message}`);

  const headings = html.match(/<h1\b/g)?.length ?? 0;
  if (headings !== 1) fail(`${headings} <h1>, expected exactly 1`);
  if (!/<html[^>]*\slang\s*=\s*"[^"]+"/.test(html)) fail('<html> has no lang');
  if (!/<main[^>]*\sid\s*=\s*"main"/.test(html)) fail('no <main id="main">');
  if (!/class="[^"]*\bskip-link\b/.test(html)) fail('no skip link');

  for (const [, attrs] of html.matchAll(/<nav\b([^>]*)>/g)) {
    if (!named(attrs)) fail('<nav> landmark with no accessible name');
  }
  for (const [, attrs] of html.matchAll(/<img\b([^>]*)>/g)) {
    // Astro renders alt="" as a bare `alt`, which HTML reads the same.
    if (!/\salt(?=[\s=]|$)/.test(attrs)) fail('<img> with no alt');
    // Not WCAG, but the same kind of slip: no size means layout shift (E3.1).
    if (!/\swidth\s*=/.test(attrs) || !/\sheight\s*=/.test(attrs)) {
      fail('<img> with no width and height');
    }
  }
  for (const [, tag, attrs, inner] of html.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
    if (text(inner) === '' && !named(attrs) && !/\stitle\s*=\s*"[^"]+"/.test(attrs)) {
      fail(`<${tag}> with no text and no accessible name`);
    }
  }
}

/* ---- run ---- */

const failures = [];
checkTokens(failures);
const pages = walk(DIST);
for (const page of pages) checkPage(page, failures);

if (failures.length) {
  console.error(`${failures.length} accessibility failure(s):`);
  for (const line of failures) console.error(`  ${line}`);
  process.exit(1);
}
console.log(`${pages.length} pages and ${TOKENS}, accessibility baseline holds`);
