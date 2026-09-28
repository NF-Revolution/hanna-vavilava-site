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

export async function apiKey() {
  const bundle = (await text(`${site}/ap/`)).match(/main-es2015\.[a-f0-9]+\.js/)?.[0];
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

/* The search is a substring match, so only the exact `s_kon` is this horse. */
export function rows(raw, name) {
  return raw
    .filter((row) => row?.s_kon === name)
    .map((row) => {
      const date = String(row.data ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
      const finished = Number(row.ukonczyl);
      // A string, one height per phase: `"120"`, or `"120/120"` for a two-phase round.
      const phases = String(row.wysokosc_p ?? '').trim();
      if (!date || (finished !== 0 && finished !== 1))
        throw new Error(`unexpected livejumping row: ${JSON.stringify(row)}`);
      return {
        date: date[0],
        finished: finished === 1,
        klasa: String(row.klasa ?? '').trim(),
        height: /^[1-9]\d*(\/[1-9]\d*)*$/.test(phases)
          ? [...new Set(phases.split('/'))].join('/')
          : null,
        place: Number(row.miejsce) || null,
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

// Fixed names: Intl's en-GB prints "Sept".
const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const ordinal = (n) =>
  n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th'));

/*
 * Every row is a start — every rider, and withdrawn (`REZ`) or unfinished rounds too.
 * The last start is the latest round the horse finished, never a withdrawal; `null`
 * when there is none, which the page shows as "on request". One season reads as a
 * sentence, since `7 · 2026: 7` says the same number twice.
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
  const last = starts.filter((s) => s.finished).sort((a, b) => b.date.localeCompare(a.date))[0];
  let lastStart = null;
  if (last) {
    const [y, m, d] = last.date.split('-');
    // Some classes already carry the height (`L 100`), which is not printed twice.
    const klasa =
      last.height && last.klasa.endsWith(` ${last.height}`)
        ? last.klasa.slice(0, -last.height.length - 1)
        : last.klasa;
    const round = [klasa, last.height && `${last.height} cm`].filter(Boolean).join(' ');
    const line = (date, place) => [date, round, place].filter(Boolean).join(' · ');
    lastStart = {
      pl: line(`${d}.${m}.${y}`, last.place && `${last.place}. miejsce`),
      en: line(`${Number(d)} ${months[m - 1]} ${y}`, last.place && `${ordinal(last.place)} place`),
    };
  }
  return { starts: count, lastStart };
}
