/*
 * The X-ray files Publish has to delete (E2.8): every file of every sold horse.
 * No imports, so `npm test` runs it without the Functions runtime. `files` is
 * read with Object.values because the Realtime Database hands a list back as
 * an object once its keys stop being 0..n-1.
 */
export const soldXrays = (horses) =>
  Object.entries(horses ?? {}).flatMap(([slug, horse]) =>
    horse?.status === 'sold'
      ? Object.values(horse.xrays?.files ?? {}).map((file) => ({ slug, key: file.key }))
      : [],
  );
