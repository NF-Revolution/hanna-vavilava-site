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

const dateOptions: Record<Locale, Intl.DateTimeFormatOptions> = {
  pl: { day: '2-digit', month: '2-digit', year: 'numeric' },
  en: { day: 'numeric', month: 'short', year: 'numeric' },
};

export function formatDate(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(htmlLang[locale], dateOptions[locale]).format(new Date(iso));
}

export function formatPrice(locale: Locale, eur: number): string {
  return new Intl.NumberFormat(htmlLang[locale], {
    style: 'currency',
    currency: 'EUR',
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
