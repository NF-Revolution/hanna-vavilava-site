// @ts-check
import { defineConfig } from 'astro/config';
import { media } from './src/media.ts';

// PLACEHOLDER domain — replaced once E0.5 (domain purchase) lands.
// `||`, not `??`: an unset GitHub repository variable arrives as an empty
// string, which `??` would pass straight through to `new URL('')`.
const SITE = process.env.SITE_URL || 'https://hannavavilava.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  // Posters are R2 object keys under `media.base` (#69); photos are Storage
  // objects, read anonymously through the Firebase host (#20).
  image: { domains: [new URL(media.base).hostname, 'firebasestorage.googleapis.com'] },
  i18n: {
    locales: ['pl', 'en'],
    defaultLocale: 'pl',
    routing: { prefixDefaultLocale: false },
  },
});
