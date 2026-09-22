// @ts-check
import { defineConfig } from 'astro/config';

// PLACEHOLDER domain — replaced once E0.5 (domain purchase) lands.
// `||`, not `??`: an unset GitHub repository variable arrives as an empty
// string, which `??` would pass straight through to `new URL('')`.
const SITE = process.env.SITE_URL || 'https://hannavavilava.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  i18n: {
    locales: ['pl', 'en'],
    defaultLocale: 'pl',
    routing: { prefixDefaultLocale: false },
  },
});
