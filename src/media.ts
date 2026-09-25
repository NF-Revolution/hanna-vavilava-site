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

/*
 * The homepage loop (E3.3), pasted from `npm run video -- <file> hero`. A file,
 * not a database field: whoever can run the encode can edit a line, and either
 * way it takes a rebuild. `null` draws the placeholder frame.
 */
// PLACEHOLDER: AI-generated stand-in (Veo, watermarked), not Hanna's footage.
// Re-run the encode on the real clip and paste its keys here.
export const hero: { mp4Key: string; webmKey: string; posterKey: string } | null = {
  mp4Key: 'home/hero-ed398659.mp4',
  webmKey: 'home/hero-c02eb71d.webm',
  posterKey: 'home/hero-497bbe4a.jpg',
};

/* The X-ray PDF ceiling (E2.10), checked in the panel and again in `functions/`. */
export const xrayMaxBytes = 100 * 1024 * 1024;
