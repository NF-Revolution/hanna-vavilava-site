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
  enquiryFailed: { pl: '/zapytanie/niewyslane', en: '/en/enquiry/not-sent' },
  menu: { pl: '/menu', en: '/en/menu' },
  privacy: { pl: '/prywatnosc', en: '/en/privacy' },
  /* The new-horse list (E5.9). Mirrored in `functions/subscribe.js`, which cannot import this. */
  notifySent: { pl: '/powiadomienia/sprawdz', en: '/en/new-horses/check' },
  notifyConfirm: { pl: '/powiadomienia/potwierdz', en: '/en/new-horses/confirm' },
  notifyConfirmed: { pl: '/powiadomienia/zapisano', en: '/en/new-horses/confirmed' },
  notifyUnsubscribe: { pl: '/powiadomienia/wypisz', en: '/en/new-horses/unsubscribe' },
  notifyUnsubscribed: { pl: '/powiadomienia/wypisano', en: '/en/new-horses/unsubscribed' },
  notifyFailed: { pl: '/powiadomienia/niezapisano', en: '/en/new-horses/failed' },
} as const;

export type RouteKey = keyof typeof routes;

export function path(locale: Locale, key: RouteKey, slug?: string): string {
  const base = routes[key][locale];
  return slug ? `${base}/${slug}` : base;
}
