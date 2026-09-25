/*
 * The admin editor's form <-> horse mapping (E2.4), kept free of the DOM so a
 * test can run it. Every form field is named by its dotted path into the
 * horse — `name`, `facts.breeding.pl`, `xrays.count` — and the output is
 * checked by `horseSchema`, the same parse the build runs, before any write.
 *
 * Photos (E2.5) and X-ray files (E2.10) are rows of dotted fields too —
 * `photos.0.alt.pl`, `xrays.files.0.key` — which the panel numbers in display order.
 *
 * ponytail: `videos` is edited as JSON until #26 gives it real controls.
 */
type Fields = Record<string, unknown>;

/* Lists of PL/EN pairs, edited as two textareas with one item per line. */
const LINES = ['suits', 'notFor'];
const JSON_PATHS = ['videos'];

export function toFields(horse: object): Fields {
  const out: Fields = {};
  const walk = (value: unknown, path: string) => {
    if (LINES.includes(path)) {
      const items = value as { pl: string; en: string }[];
      out[`${path}.pl`] = items.map((item) => item.pl).join('\n');
      out[`${path}.en`] = items.map((item) => item.en).join('\n');
    } else if (JSON_PATHS.includes(path)) {
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
  const lines = (s: unknown) =>
    String(s ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

  for (const [path, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    const keys = path.split('.');
    const last = keys.pop()!;
    let node = horse;
    for (const key of keys) node = node[key] ??= {};
    node[last] = value;
  }

  for (const path of LINES) {
    const pl = lines(fields[`${path}.pl`]);
    const en = lines(fields[`${path}.en`]);
    // A PL/EN count mismatch leaves an `undefined` half, and the parse names the row.
    horse[path] = Array.from({ length: Math.max(pl.length, en.length) }, (_, i) => ({
      pl: pl[i],
      en: en[i],
    }));
  }

  // `photos.0.key` built an object keyed "0", "1"…; integer keys enumerate in order.
  horse.photos = Object.values(horse.photos ?? {});
  if (horse.xrays?.files) {
    horse.xrays.files = Object.values(horse.xrays.files);
    // The label is optional, and two empty halves are no label.
    for (const file of horse.xrays.files) if (!file.label?.pl && !file.label?.en) delete file.label;
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
