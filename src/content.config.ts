/*
 * The build-time content loader. `/horses` and `/site` are read from the
 * Realtime Database once per build and fed to two content collections; the
 * pages stay static and a horse edit reaches the site through the Publish
 * button's rebuild (E2.6), not through a read in the browser (#17).
 *
 * Without `FIREBASE_SERVICE_ACCOUNT` — `npm run ci`, a fork, local dev — the
 * build reads `fixture.json` instead. The hosting deploy needs the same secret,
 * so a fixture build can never reach the live site.
 */
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import fixture from './fixture.json';
import { horseSchema } from './horse';

const databaseURL = 'https://hanna-vavilava-site-default-rtdb.europe-west1.firebasedatabase.app';

/* The standing facts under `/site`. Stock counts are derived from `/horses`, never stored. */
const siteSchema = z.strictObject({
  /* Digits only, no + and no spaces, which is what wa.me needs. */
  whatsapp: z.string().regex(/^\d+$/),
  telegram: z.string(),
  phone: z.string(),
  email: z.email(),
  instagram: z.url(),
  responseWindow: z.string(),
  /* The "stan stajni" date in the header and sub-bars. */
  updated: z.iso.date(),
});

type Tree = { horses: Record<string, unknown> | null; site: unknown };

async function read(): Promise<Tree> {
  const account = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!account) {
    console.warn('FIREBASE_SERVICE_ACCOUNT is not set — building from src/fixture.json');
    return fixture;
  }
  const app = initializeApp({ credential: cert(JSON.parse(account)), databaseURL });
  try {
    // Never the root: it also holds `/enquiries` and `/subscribers`.
    const db = getDatabase(app);
    const [horses, site] = await Promise.all([db.ref('horses').get(), db.ref('site').get()]);
    return { horses: horses.val(), site: site.val() };
  } finally {
    // The open database socket would otherwise keep `astro build` from exiting.
    await deleteApp(app);
  }
}

let tree: Promise<Tree> | undefined;
const load = () => (tree ??= read());

export const collections = {
  /* Keyed by slug. Astro drops the key from the data, so the strict schema still holds. */
  horses: defineCollection({
    loader: async () => ((await load()).horses ?? {}) as Record<string, Record<string, unknown>>,
    schema: horseSchema,
  }),
  site: defineCollection({
    loader: async () => {
      const { site } = await load();
      return (site ? { site } : {}) as Record<string, Record<string, unknown>>;
    },
    schema: siteSchema,
  }),
};
