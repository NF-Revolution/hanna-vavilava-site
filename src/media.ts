/*
 * Cloudflare R2 (#69) — video, posters and X-ray PDFs. The site stores object
 * keys, never URLs, so #63 changes `base` to https://media.hannavavilava.com
 * and nothing else. Keys are content-addressed (`<slug>/<name>-<sha8>.<ext>`)
 * and never overwritten, which is what makes `cacheControl` safe; every upload
 * sets it. Its own module, not part of `site.ts`, because that one reads the
 * content collections: `astro.config.mjs` imports this, and Node 22.18+ strips
 * types, so the encode script (#26) imports it directly.
 */
export const media = {
  base: 'https://hv-media.nfrevolution.com',
  bucket: 'hanna-vavilava-media',
  cacheControl: 'public, max-age=31536000, immutable',
} as const;

/* The X-ray PDF ceiling (E2.10), checked in the panel and again in `functions/`. */
export const xrayMaxBytes = 100 * 1024 * 1024;
