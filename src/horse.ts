/*
 * The shape of one horse under `/horses/<slug>` in the Realtime Database.
 * The slug is the key, not a field. The loader (E2.2) and the admin editor
 * (E2.4) both parse through this; the database rules only decide who may
 * write, never what.
 *
 * ponytail: zod comes from Astro's own copy. The submitEnquiry Function (E5.3)
 * runs outside Astro and adds `zod` itself when it imports this.
 */
import { z } from 'astro/zod';

const text = z.object({ pl: z.string(), en: z.string() });

/*
 * An object key, never a URL — no `:`, so an absolute URL cannot pass. Video,
 * posters and X-rays are R2 keys under `media.base`; photos are Storage paths,
 * `photos/<slug>/<sha8>.jpg` (E2.5).
 */
const key = z.string().regex(/^[a-z0-9][\w./-]*$/i);

/*
 * The Realtime Database stores neither `null` nor an empty array, so every
 * nullable or list field defaults: a horse read back without `xrays`, `price`
 * or `photos` is the same horse (E2.2).
 *
 * Strict, so a field nobody designed — the owner of a brokered horse above all
 * (#3) — fails the parse instead of riding through to a page.
 *
 * ponytail: `headline` serves both the detail-page hook and the list-card blurb;
 * split it when E4.x needs two lengths. The `/site` schema lives with the
 * loader, in `content.config.ts`.
 */
export const horseSchema = z.strictObject({
  /* Set in the admin editor (E2.4). Defaulted, so a horse seeded before it parses. */
  status: z.enum(['available', 'reserved', 'sold']).default('available'),
  /* List position, ascending. The editor rewrites it 0..n-1 on every move. */
  order: z.number().int().nonnegative().default(0),

  name: z.string(),
  sex: z.enum(['mare', 'gelding']),
  born: z.number().int(),
  heightCm: z.number().int().positive(),
  /* Studbook code — SP, KWPN, ZANG, Holst. A string, so a new studbook needs no deploy. */
  breed: z.string(),
  /* "Chacco-Blue × Larena (Cassini II)" — proper names, never translated. */
  pedigree: z.string(),

  levelCm: z.number().int().positive(),
  /* Whole EUR, the total the buyer pays. `null` is "on request" (#2). */
  price: z.number().int().positive().nullable().default(null),
  /* Decides the VAT invoice, the price label and the sale-kind line (#3). */
  seller: z.enum(['company', 'private']),
  headline: text,

  /* The fact-table rows no field above already carries. Labels live in i18n. */
  facts: z.object({
    breeding: text,
    trainingLevel: text,
    lastStart: text,
    starts: text,
    technique: text,
    rideability: text,
    temperament: text,
    handling: text,
    location: text,
    documents: text,
  }),

  suits: z.array(text).default([]),
  notFor: z.array(text).default([]),

  health: z.object({
    vaccinations: text,
    dewormedOn: z.string(),
    knownIssues: text,
  }),
  /* `null`: no study, the row is omitted. `files: []`: the study exists, the films are not out yet (#4). */
  xrays: z
    .object({
      count: z.number().int().positive(),
      takenOn: z.string(),
      scope: text,
      files: z
        .array(
          z.object({
            key,
            bytes: z.number().int().positive(),
            label: text.optional(),
          }),
        )
        .default([]),
    })
    .nullable()
    .default(null),

  viewing: z.object({
    lead: text,
    airport: text,
    visitDay: text,
  }),

  videos: z
    .array(
      z.object({
        key,
        kind: z.enum(['sales', 'round']),
        posterKey: key,
        durationS: z.number().int().positive(),
        transcript: text,
        /*
         * The heading row after the duration: "nagrane 12.09.2026 · bez podkładu
         * muzycznego", "jedna kamera · 6.09.2026, Zakrzów, 125 cm" (E4.5). Free
         * text, because the two boards' rows carry different facts.
         */
        note: text.default({ pl: '', en: '' }),
      }),
    )
    .default([]),
  /*
   * The first is the cover — the detail hero and the grid card. `caption` is the
   * short visible gallery label and may be empty; `alt` never may.
   */
  photos: z
    .array(
      z.object({
        key,
        alt: z.object({ pl: z.string().trim().min(1), en: z.string().trim().min(1) }),
        caption: text,
      }),
    )
    .default([]),
});

export type Horse = z.infer<typeof horseSchema>;
