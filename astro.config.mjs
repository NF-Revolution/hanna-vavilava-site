// @ts-check
import { defineConfig } from 'astro/config';

// PLACEHOLDER domain — replaced once E0.5 (domain purchase) lands.
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
