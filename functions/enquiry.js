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
});

/*
 * The record to store, or `null`. Unknown keys are stripped, and so is an empty
 * optional field: the database takes no `undefined`, and the inbox shows every key.
 */
export function parseEnquiry(body) {
  const parsed = enquirySchema.safeParse(body ?? {});
  if (!parsed.success) return null;
  return Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v));
}

/*
 * Where the no-JavaScript post lands. Chosen here from `locale`, never taken from
 * the request, so the endpoint is no open redirect.
 * ponytail: mirrors `enquirySent` in `src/i18n/routes.ts`; `functions/` deploys on
 * its own and cannot import `src/`.
 */
export const sentPath = { pl: '/zapytanie/wyslane', en: '/en/enquiry/sent' };
