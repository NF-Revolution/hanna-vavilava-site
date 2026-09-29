/*
 * The enquiry the E5.1 form posts (E5.3). Select values are the language-neutral
 * codes the form renders from the dictionaries; `tests/enquiry.test.mjs` holds
 * this schema and both dictionaries to the same codes, so neither drifts alone.
 */
import { z } from 'zod';

const text = (max) => z.string().trim().max(max);

/* `@handle`, `handle` or a pasted profile link, down to the handle. */
const handle = (s) =>
  s
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0];

export const enquirySchema = z.object({
  name: text(100).min(1),
  country: text(60).min(1),
  // The form's own pattern, re-checked; stored bare, the shape a wa.me link wants (#43).
  whatsapp: text(30)
    .regex(/^\+\d[\d\s-]{5,}\d$/)
    .transform((s) => s.replace(/[\s-]/g, '')),
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
  const parsed = enquirySchema.safeParse(body ?? {});
  if (!parsed.success) return null;
  const { ref, ...data } = parsed.data;
  data.source = campaign(data.page, ref);
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v));
}

/*
 * Where the no-JavaScript post lands. Chosen here from `locale`, never taken from
 * the request, so the endpoint is no open redirect.
 * ponytail: mirrors `enquirySent` in `src/i18n/routes.ts`; `functions/` deploys on
 * its own and cannot import `src/`.
 */
export const sentPath = { pl: '/zapytanie/wyslane', en: '/en/enquiry/sent' };
