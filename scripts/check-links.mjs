/*
 * Internal link check over dist/. Catches a localised path that drifted from
 * the route table — the failure this site is most prone to, because every page
 * exists twice under different names.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
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

if (broken.length) {
  console.error(`${broken.length} broken internal link(s):`);
  for (const line of broken) console.error(`  ${line}`);
  process.exit(1);
}
console.log(`${pages.length} pages, no broken internal links`);
