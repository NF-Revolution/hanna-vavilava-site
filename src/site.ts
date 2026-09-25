/*
 * Standing site facts — the single seam. Contact details come from the
 * database's `/site` node and the stock counts from `/horses`, both read at
 * build time by `content.config.ts`. Nothing else in the codebase should
 * hardcode a contact detail or a stock count.
 */
import { getCollection, getEntry } from 'astro:content';

const horses = (await getCollection('horses')).sort(
  (a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id),
);
const available = horses.filter((h) => h.data.status === 'available');
const facts = await getEntry('site', 'site');
if (!facts) throw new Error('`/site` is missing from the Realtime Database');

const first = available[0];

export const site = {
  ...facts.data,
  /* Reserved and sold horses keep their pages but leave the count. */
  horsesAvailable: available.length,
  /*
   * The horse named on the bottom edge of the homepage, one of its three ways
   * in. ponytail: the first available horse in the editor's order; a featured
   * flag if Hanna ever wants a different one. `undefined` when none is
   * available, and the line is omitted.
   */
  featuredHorse: first && { slug: first.id, ...first.data },
  /* The horses index, in the editor's order. A sold horse keeps its page but leaves the list (#23). */
  horsesListed: horses
    .filter((h) => h.data.status !== 'sold')
    .map((h) => ({ slug: h.id, ...h.data })),
};

export const whatsappHref = (text?: string): string =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const telegramHref = `https://t.me/${site.telegram}`;
export const emailHref = `mailto:${site.email}`;
export const phoneHref = `tel:${site.phone.replace(/[^\d+]/g, '')}`;
