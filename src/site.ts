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

/*
 * Whether search engines may index this build (E6.4). Only the live deploy on
 * the real domain: a preview channel and the `.web.app` host before #63 are full
 * copies of the site on a throwaway host. Fail-closed — only `deploy.yml` sets
 * the channel, and #63 changing `SITE_URL` flips it with no second switch.
 */
export const indexable =
  process.env.HOSTING_CHANNEL === 'live' &&
  !/\.(web\.app|firebaseapp\.com)$/.test(new URL(import.meta.env.SITE).hostname);

/*
 * Analytics (E6.6): Umami Cloud, Hobby plan, EU region — free, cookieless, custom
 * events. The endpoint is the one Umami's own `script.js` posts to; the account's
 * region decides where the data lives. Only the live deploy reports, so previews
 * and CI never pollute the numbers, and it does not wait for `indexable` (#63).
 */
export const umami = {
  endpoint: 'https://gateway.umami.is/api/send',
  website: '', // PLACEHOLDER — the website ID from the owner's Umami Cloud account
};
export const analytics = process.env.HOSTING_CHANNEL === 'live' && umami.website !== '';

export const whatsappHref = (text?: string): string =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/*
 * The invisible Turnstile widget's public key (E5.6). `npm run dev` uses Cloudflare's
 * invisible always-pass test key, whose dummy token only the test secret accepts.
 */
export const turnstileSitekey = import.meta.env.DEV
  ? '1x00000000000000000000BB'
  : '0x4AAAAAAFJbzp2taQ6gAIa0';

/* Invisible mode's condition: the privacy notice links this (E5.6, #59). */
export const turnstilePrivacyHref = 'https://www.cloudflare.com/turnstile-privacy-policy/';

/* `t.me/<user>?text=` pre-enters the draft (core.telegram.org/api/links), as wa.me does. */
export const telegramHref = (text?: string): string =>
  `https://t.me/${site.telegram}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
/* encodeURIComponent, not URLSearchParams: mail clients print its `+` for a space as-is. */
export const emailHref = (subject?: string, body?: string): string =>
  `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body ?? '')}` : ''}`;
export const phoneHref = `tel:${site.phone.replace(/[^\d+]/g, '')}`;

/*
 * Livejumping has no stable per-horse page (#108), so a horse links to its name search,
 * cut at the first symbol as `searchTerm` in `functions/starts.js` does: `B&C` finds nothing.
 */
export const livejumpingHref = (name: string): string =>
  `https://livejumping.com/ap/search/horse/${encodeURIComponent(name.split(/[^\p{L}\p{N} ]/u)[0].trim())}`;
