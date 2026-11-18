/*
 * The shape of one horse under `/horses/<slug>` in the Realtime Database.
 * The slug is the key, not a field. The loader (E2.2) and the admin editor
 * (E2.4) both parse through this; the database rules only decide who may
 * write, never what.
 *
 * ponytail: zod comes from Astro's own copy.
 */
import { z } from 'astro/zod';

const text = z.object({ pl: z.string(), en: z.string() });

/*
 * An object key, never a URL — no `:`, so an absolute URL cannot pass. Video,
 * posters and X-rays are R2 keys under `media.base`; photos are Storage paths,
 * `photos/<slug>/<sha8>.jpg` (E2.5).
 */
const key = z.string().regex(/^[a-z0-9][\w./-]*$/i);

/* A photo's alt text, which may never be empty. */
const alt = z.object({ pl: z.string().trim().min(1), en: z.string().trim().min(1) });

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
  headline: text,
  /* One free text, Hanna's own story of the horse (E4.20). A blank line is a paragraph. */
  description: text,
  /*
   * The exact name on livejumping.com, e.g. `LOTUS BLUE B&C`. The page links "Results on
   * livejumping" to its name search under the example results; empty is no link. Nothing
   * syncs from it since E4.23 (#197).
   */
  livejumpingName: z.string().trim().default(''),

  /* The fact-table rows no field above already carries. Labels live in i18n. */
  facts: z.object({
    breeding: text,
    /*
     * Example results (E4.23, decided on #196): up to three rounds Hanna picks, each typed
     * in the panel beside its livejumping link, which the page offers as the source. Nothing
     * syncs them: livejumping gates its API against bots. Language-neutral — `N 120 cm`,
     * `0 / 70,78` — and worded by the page. `null` hides the row.
     */
    cleanRounds: z
      .array(
        z.object({
          url: z.url({ protocol: /^https$/ }),
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          round: z.string().trim().min(1),
          result: z.string().trim().min(1),
        }),
      )
      .max(3)
      .nullable()
      .default(null),
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

  videos: z
    .array(
      z.object({
        key,
        /* The clip's heading and its VideoObject name (E4.20). Never empty. */
        title: z.object({ pl: z.string().trim().min(1), en: z.string().trim().min(1) }),
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
   * Uploaded on its own (E4.24): the detail hero, the list and grid cards, the other-horses
   * cards, the link preview card and the Product image. Never repeated in the gallery.
   */
  cover: z.object({ key, alt }).nullable().default(null),
  /* The gallery only. `caption` is the short visible label and may be empty; `alt` never may. */
  photos: z.array(z.object({ key, alt, caption: text })).default([]),
  /*
   * A portrait shot for the 390 hero (#149), which the landscape cover cannot
   * fill without losing the head. Without one the phone crops the cover. The
   * alt is the cover's: the same horse, the same moment.
   */
  phoneCover: key.nullable().default(null),
});

export type Horse = z.infer<typeof horseSchema>;
