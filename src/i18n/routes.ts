import type { Locale } from './index';

/*
 * Localised paths. Every link in the site goes through path() so the language
 * switch can map the current page onto its twin, and so the same table feeds
 * the hreflang tags. Horse pages take the slug as an extra segment.
 */
export const routes = {
  home: { pl: '/', en: '/en' },
  horses: { pl: '/konie', en: '/en/horses' },
  horsesGrid: { pl: '/konie/siatka', en: '/en/horses/grid' },
  horse: { pl: '/konie', en: '/en/horses' },
  about: { pl: '/o-mnie', en: '/en/about' },
  faq: { pl: '/pytania', en: '/en/questions' },
  enquiry: { pl: '/zapytanie', en: '/en/enquiry' },
  enquirySent: { pl: '/zapytanie/wyslane', en: '/en/enquiry/sent' },
  menu: { pl: '/menu', en: '/en/menu' },
  privacy: { pl: '/prywatnosc', en: '/en/privacy' },
} as const;

export type RouteKey = keyof typeof routes;

export function path(locale: Locale, key: RouteKey, slug?: string): string {
  const base = routes[key][locale];
  return slug ? `${base}/${slug}` : base;
}
