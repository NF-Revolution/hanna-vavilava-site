/*
 * A horse's starts from livejumping.com (E2.12, decided on #108). The search page's
 * own API, undocumented, with the key their public bundle ships — read on every run,
 * so a rotated key costs nothing. Anything unexpected throws, and the caller keeps
 * the stored facts: a wrong count on the site is worse than a week-old one.
 * No imports, so `npm test` runs the formatting without the Functions runtime.
 */
const site = 'https://livejumping.com';
const timeout = () => AbortSignal.timeout(15_000);

async function text(url) {
  const res = await fetch(url, { signal: timeout() });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
}

/*
 * The main bundle, read from its script tag so any Angular naming matches: `main.<hash>.js`
 * (since 2026-10), `main-es2015.<hash>.js` (before) and esbuild's `main-<HASH>.js` (E2.17).
 * ponytail: still scrapes their HTML, so the next rename throws the same way and stores
 * nothing. A failing `startsWeekly` log line is the only alarm; alert on it if this repeats.
 */
export const bundleName = (html) => html.match(/src="(main[\w.-]*\.js)"/)?.[1];

export async function apiKey() {
  const bundle = bundleName(await text(`${site}/ap/`));
  if (!bundle) throw new Error('livejumping bundle not found');
  const key = (await text(`${site}/ap/${bundle}`)).match(/api:\{key:"([^"]+)"/)?.[1];
  if (!key) throw new Error('livejumping key not found in the bundle');
  return key;
}

/*
 * The search matches substrings but finds nothing once the term holds a symbol
 * (`LOTUS BLUE B&C` → 0 rows, `LOTUS BLUE B` → all of them), so it is cut at the first one.
 */
export const searchTerm = (name) => name.split(/[^\p{L}\p{N} ]/u)[0].trim();

/* One calendar year: the API takes `year` and returns that year only. */
async function fetchYear(key, name, year) {
  const res = await fetch(`${site}/api/v1/search/horse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', apikey: key },
    body: JSON.stringify({ szukaj: searchTerm(name), year }),
    signal: timeout(),
  });
  if (!res.ok) throw new Error(`livejumping answered ${res.status} for ${year}`);
  const results = (await res.json())?.data?.results;
  if (!Array.isArray(results?.data)) throw new Error(`unexpected livejumping JSON for ${year}`);
  // ponytail: a paged year throws rather than undercounting. Follow `page` if one ever shows up.
  if (results.last_page > 1) throw new Error(`livejumping paged ${year}; not supported yet`);
  return results.data;
}

const iso = (value) => String(value ?? '').match(/^\d{4}-\d{2}-\d{2}/)?.[0];

/*
 * The result as livejumping prints it (E4.21): `wyniki` holds one value per column of the
 * class, `kolumny` says which round each column belongs to. Values join with ` / ` inside
 * a round and rounds with ` · ` — `4 / 71,50`, `0 / 51,71 · 0 / 35,30`, ` ELI` → `ELI`.
 * Hidden columns and empty values are left out.
 */
export function result(row) {
  const values = JSON.parse(row.wyniki || '[]');
  const columns = JSON.parse(row.kolumny || '[]');
  if (!Array.isArray(values) || !Array.isArray(columns))
    throw new Error(`unexpected livejumping result: ${row.wyniki}`);
  const hidden = new Set(columns.filter((c) => c?.Ukryta === '1').map((c) => c.Id_kolumny));
  const round = new Map(columns.map((c) => [c?.Id_kolumny, c?.Runda]));
  const rounds = new Map();
  for (const v of values) {
    const value = String(v?.Wartosc ?? '').trim();
    if (!value || hidden.has(v?.Id_kolumny)) continue;
    const r = round.get(v?.Id_kolumny) ?? '1';
    rounds.set(r, [...(rounds.get(r) ?? []), value]);
  }
  return [...rounds.values()].map((round) => round.join(' / ')).join(' · ');
}

/* The search is a substring match, so only the exact `s_kon` is this horse. */
export function rows(raw, name) {
  return raw
    .filter((row) => row?.s_kon === name)
    .map((row) => {
      const date = iso(row.data);
      const prize = Number(row.nagroda);
      const finished = Number(row.ukonczyl);
      const show = Number(row.id_zawodow);
      // A string, one height per phase: `"120"`, or `"120/120"` for a two-phase round.
      const phases = String(row.wysokosc_p ?? '').trim();
      const valid = /^[1-9]\d*(\/[1-9]\d*)*$/.test(phases);
      if (!date || (finished !== 0 && finished !== 1) || !Number.isInteger(show) || show < 1)
        throw new Error(`unexpected livejumping row: ${JSON.stringify(row)}`);
      return {
        date,
        finished: finished === 1,
        klasa: String(row.klasa ?? '').trim(),
        height: valid ? [...new Set(phases.split('/'))].join('/') : null,
        twoPhase: valid && phases.includes('/'),
        place: Number(row.miejsce) || null,
        // The competition (E4.21): one id per show, shared by every round of it.
        show,
        showName: String(row.zawody?.nazwa ?? '')
          .replace(/\s+/g, ' ')
          .trim(),
        venue: String(row.zawody?.miejsce ?? '').trim(),
        from: iso(row.data_od) ?? date,
        to: iso(row.data_do) ?? date,
        result: result(row),
        prize: prize > 0 ? `${prize} ${row.waluta || 'PLN'}` : null,
      };
    });
}

export async function fetchStarts(key, name, born) {
  const now = Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format().slice(0, 4),
  );
  const all = [];
  for (let year = born + 4; year <= now; year++)
    all.push(...rows(await fetchYear(key, name, year), name));
  return all;
}

/* "N 120 cm". Some classes already carry the height (`L 100`), which is not printed twice. */
function roundName({ klasa, height }) {
  const name = height && klasa.endsWith(` ${height}`) ? klasa.slice(0, -height.length - 1) : klasa;
  return [name, height && `${height} cm`].filter(Boolean).join(' ');
}

/*
 * Every row is a start — every rider, and withdrawn (`REZ`) or unfinished rounds too.
 * One season reads as a sentence, since `7 · 2026: 7` says the same number twice.
 *
 * The last show (E4.21) is the show of the latest round the horse finished, so a show of
 * only eliminations never stands in for it (owner's rule on #190); inside it every round
 * is listed, newest first, eliminations too. `null` when there is no finished round, which
 * the page shows as "on request". Language-neutral, so the page words it: an absent key
 * is an absent value, as the database stores it.
 */
export function startFacts(starts) {
  const seasons = {};
  for (const { date } of starts) seasons[date.slice(0, 4)] = (seasons[date.slice(0, 4)] ?? 0) + 1;
  const years = Object.keys(seasons).sort().reverse();
  const n = starts.length;
  let count;
  if (years.length === 1) {
    const pl = { one: 'start', few: 'starty', many: 'startów' }[
      new Intl.PluralRules('pl').select(n)
    ];
    count = {
      pl: `${n} ${pl} w sezonie ${years[0]}`,
      en: `${n} start${n === 1 ? '' : 's'} in the ${years[0]} season`,
    };
  } else {
    const line = [n, ...years.map((year) => `${year}: ${seasons[year]}`)].join(' · ');
    count = { pl: line, en: line };
  }

  // A stable sort: two rounds on one day keep the API's order, newest first.
  const newest = [...starts].sort((a, b) => b.date.localeCompare(a.date));
  const last = newest.find((s) => s.finished);
  const lastShow = last && {
    name: last.showName,
    venue: last.venue,
    from: last.from,
    to: last.to,
    rounds: newest
      .filter((s) => s.show === last.show)
      .map((s) => ({
        date: s.date,
        round: roundName(s),
        ...(s.twoPhase && { twoPhase: true }),
        ...(s.place && { place: s.place }),
        ...(s.result && { result: s.result }),
        ...(s.prize && { prize: s.prize }),
      })),
  };
  return { starts: count, lastShow: lastShow ?? null };
}
