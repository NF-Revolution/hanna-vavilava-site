/*
 * The enquiry the E5.1 form posts (E5.3). Select values are the language-neutral
 * codes the form renders from the dictionaries; `tests/enquiry.test.mjs` holds
 * this schema and both dictionaries to the same codes, so neither drifts alone.
 */
import { z } from 'zod';
import { labels, searchHeading, waReply, wishes } from './notify.js';

const text = (max) => z.string().trim().max(max);

/* `@handle`, `handle` or a pasted profile link, down to the handle. */
const handle = (s) =>
  s
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0];

// The form's own pattern, re-checked; stored bare, the shape a wa.me link wants (#43).
const whatsapp = text(30)
  .regex(/^\+\d[\d\s-]{5,}\d$/)
  .transform((s) => s.replace(/[\s-]/g, ''));

export const enquirySchema = z.object({
  name: text(100).min(1),
  country: text(60).min(1),
  whatsapp,
  instagram: text(100).transform(handle).optional(),
  level: z.enum(['junior', 'amateur110', 'amateur125', 'pro']),
  budget: z.enum(['15-20', '20-30', '30-40', '40plus']),
  timeframe: z.enum(['month', 'quarter', 'season', 'browsing']),
  // A horse slug, or `undecided`, which the same pattern takes.
  horse: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  note: text(2000).optional(),
  locale: z.enum(['pl', 'en']),
  // `location.href` and `document.referrer` at submit (#43); only ever shown as text.
  page: text(500).optional(),
  ref: text(500).optional(),
});

/*
 * The enquiry page's search form (E5.2, #126), for a buyer none of the listed horses
 * fits: free-text wishes and a number to write back to. It keeps `kind`, so the inbox
 * and both messages tell it from an enquiry about a horse, which carries no `kind`.
 */
export const searchSchema = z.object({
  kind: z.literal('search'),
  level: text(100).optional(),
  budget: text(100).optional(),
  height: text(100).optional(),
  age: text(100).optional(),
  when: text(100).optional(),
  whatsapp,
  locale: z.enum(['pl', 'en']),
  page: text(500).optional(),
  ref: text(500).optional(),
});

const utm = ['utm_source', 'utm_medium', 'utm_campaign'];

/*
 * Where the buyer came from (#43): the UTM tags of the form's page or, failing that,
 * of the page before it, else the host of an outside referrer.
 * ponytail: one page back only. The first visit's source in `sessionStorage` reaches
 * further, but it stores data on the device, which needs a ruling under #59 first.
 */
export function campaign(page, ref) {
  const [here, before] = [page, ref].map((u) => URL.parse(u ?? ''));
  const tagged = [here, before].find((u) => u?.searchParams.get('utm_source'));
  if (tagged)
    return utm
      .map((k) => tagged.searchParams.get(k))
      .filter(Boolean)
      .join(' / ');
  if (before && before.host !== here?.host) return before.host;
  return undefined;
}

/*
 * The record to store, or `null`. Unknown keys are stripped, and so is an empty
 * optional field: the database takes no `undefined`, and the inbox shows every key.
 * The raw referrer is not kept, only the source read from it.
 */
export function parseEnquiry(body) {
  // The union, discriminated by hand: a main-form post sends no `kind` at all.
  const schema = body?.kind === 'search' ? searchSchema : enquirySchema;
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) return null;
  const { ref, ...data } = parsed.data;
  data.source = campaign(data.page, ref);
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v));
}

/*
 * The email the second sink sends (E5.5), plain Polish text for the shared mailbox.
 * The buyer leaves no address, so the way back is the wa.me link with Telegram's
 * greeting (#43), less the horse's name, which would cost this sink a database read.
 */
export function enquiryEmail(r) {
  const search = r.kind === 'search';
  const horse = r.horse === 'undecided' ? 'bez konia' : r.horse;
  const lines = [
    ['Imię', r.name],
    ['Kraj', r.country],
    ['WhatsApp', `${r.whatsapp} ${waReply(r)}`],
    ['Instagram', r.instagram && `https://instagram.com/${r.instagram}`],
    ...(search
      ? wishes.map(([key, label]) => [label, r[key]])
      : [
          ['Poziom', labels.levels[r.level]],
          ['Budżet', labels.budgets[r.budget]],
          ['Termin', labels.timeframes[r.timeframe]],
        ]),
    ['Koń', horse],
    ['Język', r.locale],
    ['Strona', r.page],
    ['Źródło', r.source],
    ['Wiadomość', r.note],
  ];
  return {
    subject: search
      ? `${searchHeading} — ${r.whatsapp}`
      : `Zapytanie: ${horse} — ${r.name}, ${r.country}`,
    text: lines
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n'),
  };
}

/*
 * Where the no-JavaScript post lands. Chosen here from `locale`, never taken from
 * the request, so the endpoint is no open redirect.
 * ponytail: mirrors `enquirySent` in `src/i18n/routes.ts`; `functions/` deploys on
 * its own and cannot import `src/`.
 */
export const sentPath = { pl: '/zapytanie/wyslane', en: '/en/enquiry/sent' };

/* Where a refused or failed post lands (E5.7); the same mirror, of `enquiryFailed`. */
export const failedPath = { pl: '/zapytanie/niewyslane', en: '/en/enquiry/not-sent' };

/*
 * The privacy notice's promise (E7.7): a handled enquiry is deleted six months after
 * `handledAt`, and one marked `sale` never, because tax law keeps it. Returned as one
 * `update()` on `/enquiries`, where `null` deletes. A record handled before `handledAt`
 * existed gets today as its clock, so it expires on time instead of never.
 * Calendar months: past a month end the cutoff overflows and deletes a day or two early.
 */
export function expired(all, now = Date.now()) {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - 6);
  const update = {};
  for (const [id, e] of Object.entries(all ?? {})) {
    if (e?.handled !== true || e.sale === true) continue;
    if (typeof e.handledAt !== 'number') update[`${id}/handledAt`] = now;
    else if (e.handledAt < cutoff.getTime()) update[id] = null;
  }
  return update;
}
