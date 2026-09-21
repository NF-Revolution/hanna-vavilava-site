// @ts-check
import { defineConfig } from 'astro/config';

// hannavavilava.com is the production origin, bought at launch (E8.1). Until then
// SITE_URL carries the Firebase .web.app URL, so nothing here moves twice (E0.5).
const SITE = process.env.SITE_URL ?? 'https://hannavavilava.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  i18n: {
    locales: ['pl', 'en'],
    defaultLocale: 'pl',
    routing: { prefixDefaultLocale: false },
  },
});
