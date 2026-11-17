/*
 * The admin editor's form <-> horse mapping (E2.4), kept free of the DOM so a
 * test can run it. Every form field is named by its dotted path into the
 * horse — `name`, `facts.breeding.pl`, `xrays.count` — and the output is
 * checked by `horseSchema`, the same parse the build runs, before any write.
 *
 * Photos (E2.5) and X-ray files (E2.10) are rows of dotted fields too —
 * `photos.0.alt.pl`, `xrays.files.0.key` — which the panel numbers in display order.
 *
 * ponytail: `videos` is edited as JSON, pasted from `npm run video` (#26), which
 * owns the encode and the upload. Give it rows if hand-editing ever gets common.
 */
type Fields = Record<string, unknown>;

const JSON_PATHS = ['videos'];

export function toFields(horse: object): Fields {
  const out: Fields = {};
  const walk = (value: unknown, path: string) => {
    if (JSON_PATHS.includes(path)) {
      out[path] = JSON.stringify(value, null, 2);
    } else if (value !== null && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) walk(child, path ? `${path}.${key}` : key);
    } else if (value != null) {
      out[path] = value;
    }
  };
  walk(horse, '');
  return out;
}

/* `undefined` is an empty number input: the key is left out and the schema decides. */
export function fromFields(fields: Fields): Record<string, any> {
  const horse: Record<string, any> = {};

  for (const [path, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    const keys = path.split('.');
    const last = keys.pop()!;
    let node = horse;
    for (const key of keys) node = node[key] ??= {};
    node[last] = value;
  }

  // `photos.0.key` built an object keyed "0", "1"…; integer keys enumerate in order.
  horse.photos = Object.values(horse.photos ?? {});
  // An empty hidden input is no image: no phone cover, and no cover, its alt text with it.
  horse.phoneCover ||= null;
  if (!horse.cover?.key) horse.cover = null;
  if (horse.xrays?.files) {
    horse.xrays.files = Object.values(horse.xrays.files);
    // The label is optional, and two empty halves are no label.
    for (const file of horse.xrays.files) if (!file.label?.pl && !file.label?.en) delete file.label;
  }

  /*
   * Example results (E4.23): rows `facts.cleanRounds.0.url`…, numbered by the panel. An
   * all-empty row is no round, and no round at all hides the row on the page.
   */
  if (horse.facts?.cleanRounds) {
    const rounds = Object.values(horse.facts.cleanRounds as Record<string, Fields>).filter((r) =>
      Object.values(r).some((v) => v !== undefined && String(v).trim()),
    );
    horse.facts.cleanRounds = rounds.length ? rounds : null;
  }

  for (const path of JSON_PATHS) {
    const keys = path.split('.');
    const last = keys.pop()!;
    const node = keys.reduce((n, key) => n?.[key], horse);
    if (!node || !(last in node)) continue;
    const raw = String(node[last]).trim();
    try {
      node[last] = raw ? JSON.parse(raw) : [];
    } catch {
      // Left a string, so the parse reports it at this field.
    }
  }

  // No count and no files is "no study" (#4); a count left empty beside files is an error.
  const xrays = horse.xrays;
  if (!xrays || (xrays.count === undefined && !xrays.files?.length)) horse.xrays = null;

  return horse;
}

/*
 * Dotted paths of the blank half of every PL/EN pair with one half filled (E7.2),
 * `facts.breeding.en` — the form's own field names, so the panel can focus one.
 * Both halves empty is "not given" and passes.
 *
 * ponytail: the editor checks, the schema does not, so a horse already stored with
 * a half pair cannot fail the build. Move it into `horseSchema` once the data is clean.
 */
export function halfPairs(value: unknown, path = ''): string[] {
  if (value === null || typeof value !== 'object') return [];
  const node = value as Record<string, unknown>;
  if (typeof node.pl === 'string' && typeof node.en === 'string') {
    const pl = node.pl.trim();
    const en = node.en.trim();
    return pl && !en ? [`${path}.en`] : en && !pl ? [`${path}.pl`] : [];
  }
  return Object.entries(node).flatMap(([key, child]) =>
    halfPairs(child, path ? `${path}.${key}` : key),
  );
}
