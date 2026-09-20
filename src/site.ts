/*
 * Standing site facts.
 *
 * Every value here is PLACEHOLDER until E8.6. This module is the single seam
 * the database's `/site` node replaces in ticket 2.2 — nothing else in the
 * codebase should hardcode a contact detail or a stock count.
 */
export const site = {
  /* PLACEHOLDER — digits only, no + and no spaces, which is what wa.me needs. */
  whatsapp: '48000000000',
  /* PLACEHOLDER */
  telegram: 'placeholder',
  /* PLACEHOLDER */
  phone: '+48 000 000 000',
  /* PLACEHOLDER */
  email: 'kontakt@przyklad.pl',
  /* PLACEHOLDER */
  instagram: 'https://instagram.com/placeholder',

  horsesAvailable: 4,
  /* PLACEHOLDER — the "stan stajni" date shown in the header and sub-bars. */
  updated: '2026-09-19',
  responseWindow: '8:00–21:00 CET',

  /*
   * PLACEHOLDER — the horse named on the bottom edge of the homepage, one of
   * its three ways in. Replaced by the first `available` horse from the
   * content collection in ticket 2.2.
   */
  featuredHorse: {
    slug: 'cascada',
    name: 'Cascada',
    born: 2017,
    heightCm: 168,
    levelCm: 125,
    priceEur: 32000,
  },
} as const;

export const whatsappHref = (text?: string): string =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const telegramHref = `https://t.me/${site.telegram}`;
export const emailHref = `mailto:${site.email}`;
export const phoneHref = `tel:${site.phone.replace(/[^\d+]/g, '')}`;
