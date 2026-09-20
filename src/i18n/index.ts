import pl from './pl.json';
import en from './en.json';

export const locales = ['pl', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pl';

/* BCP 47 tags for the lang attribute and hreflang. */
export const htmlLang: Record<Locale, string> = { pl: 'pl-PL', en: 'en' };

const dictionaries = { pl, en } satisfies Record<Locale, typeof pl>;

export type Dictionary = typeof pl;

export function t(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/* Derives the locale from a URL, so components do not each re-parse it. */
export function localeFromUrl(url: URL): Locale {
  return url.pathname === '/en' || url.pathname.startsWith('/en/') ? 'en' : defaultLocale;
}
