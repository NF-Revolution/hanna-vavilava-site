/*
 * Standing site facts — the single seam. Contact details come from the
 * database's `/site` node and the stock counts from `/horses`, both read at
 * build time by `content.config.ts`. Nothing else in the codebase should
 * hardcode a contact detail or a stock count.
 */
import { getCollection, getEntry } from 'astro:content';

const horses = await getCollection('horses');
const facts = await getEntry('site', 'site');
if (!facts) throw new Error('`/site` is missing from the Realtime Database');

const first = horses[0];

export const site = {
  ...facts.data,
  /* ponytail: every horse counts as available until the sold state (E2.8) adds a status. */
  horsesAvailable: horses.length,
  /*
   * The horse named on the bottom edge of the homepage, one of its three ways
   * in. ponytail: the first by slug; E2.8's status or a featured flag picks
   * properly. `undefined` when the stable is empty, and the line is omitted.
   */
  featuredHorse: first && { slug: first.id, ...first.data },
};

export const whatsappHref = (text?: string): string =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const telegramHref = `https://t.me/${site.telegram}`;
export const emailHref = `mailto:${site.email}`;
export const phoneHref = `tel:${site.phone.replace(/[^\d+]/g, '')}`;
