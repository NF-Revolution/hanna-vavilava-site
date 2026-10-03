import type { APIRoute } from 'astro';
import { locales, htmlLang, t } from '../i18n';
import { path } from '../i18n/routes';
import { icons, GROUND } from '../icons';

/*
 * Home-screen name and icons (E6.5). `display: browser` on purpose: a sales
 * site wants its address bar and no install prompt.
 * ponytail: one manifest in the default locale; a per-locale manifest if
 * installs from the English pages ever matter.
 */
export const GET: APIRoute = () => {
  const locale = locales[0]!;
  const dict = t(locale);
  return Response.json({
    name: dict.brand.name,
    short_name: dict.brand.name,
    description: dict.brand.tagline,
    lang: htmlLang[locale],
    start_url: path(locale, 'home'),
    display: 'browser',
    theme_color: GROUND,
    background_color: GROUND,
    icons: Object.entries(icons).flatMap(([src, icon]) =>
      'purpose' in icon
        ? [
            {
              src: `/${src}`,
              sizes: `${icon.size}x${icon.size}`,
              type: 'image/png',
              purpose: icon.purpose,
            },
          ]
        : [],
    ),
  });
};
