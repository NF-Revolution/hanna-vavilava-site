import { htmlLang, type Locale } from './index';

/* Replaces {name} placeholders. No template library — this is the whole need. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

/*
 * Polish needs one/few/many/other ("1 koń", "4 konie", "5 koni"), so the
 * counts in the header and menu go through Intl.PluralRules rather than a
 * hardcoded string. English collapses to one/other on its own.
 */
export function plural(locale: Locale, forms: PluralForms, count: number): string {
  const rule = new Intl.PluralRules(htmlLang[locale]).select(count);
  return fill(forms[rule] ?? forms.other, { count });
}

/* "19.09.2026" in both languages, as the EN boards draw it (E7.2): digits need no translation. */
const dateFormat = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatDate(_locale: Locale, iso: string): string {
  return dateFormat.format(new Date(iso));
}

/* "10–11.10.2026", one date when both are the same day — the same digits as formatDate. */
export function formatDateRange(_locale: Locale, from: string, to: string): string {
  return dateFormat.formatRange(new Date(from), new Date(to));
}

/* "2." in Polish, "2nd" in English, before the word for place. */
const suffix = { one: 'st', two: 'nd', few: 'rd', other: 'th' } as Record<string, string>;
const ordinals = new Intl.PluralRules('en', { type: 'ordinal' });
export function ordinal(locale: Locale, n: number): string {
  return locale === 'en' ? `${n}${suffix[ordinals.select(n)]}` : `${n}.`;
}

export function formatPrice(locale: Locale, eur: number): string {
  return new Intl.NumberFormat(htmlLang[locale], {
    style: 'currency',
    currency: 'EUR',
    /* "EUR 32,000" / "32 000 EUR", as both boards and the budget options write it (E7.2). */
    currencyDisplay: 'code',
    maximumFractionDigits: 0,
  }).format(eur);
}

/* "24 MB" — decimal megabytes, as the owner's file manager shows the same PDF. */
export function formatSize(locale: Locale, bytes: number): string {
  return new Intl.NumberFormat(htmlLang[locale], {
    style: 'unit',
    unit: 'megabyte',
    maximumSignificantDigits: 2,
  }).format(bytes / 1e6);
}
