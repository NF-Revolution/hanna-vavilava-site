/*
 * The Telegram message for a stored enquiry (#43), in Hanna's Polish, with one
 * button that opens WhatsApp to the buyer with a greeting already typed in the
 * buyer's language: tap the button, tap send.
 */

/*
 * The form's Polish option text, by code.
 * ponytail: mirrors `enquiryForm` in `src/i18n/pl.json`, because `functions/`
 * cannot import `src/`; `tests/notify.test.mjs` holds the two equal.
 */
export const labels = {
  levels: {
    junior: 'Junior z trenerem',
    amateur110: 'Amator, parkury do 110 cm',
    amateur125: 'Amator, parkury 110–125 cm',
    pro: 'Zawodowo, od 130 cm',
  },
  budgets: {
    '15-20': '15 000 – 20 000 EUR',
    '20-30': '20 000 – 30 000 EUR',
    '30-40': '30 000 – 40 000 EUR',
    '40plus': 'Powyżej 40 000 EUR',
  },
  timeframes: {
    month: 'W tym miesiącu',
    quarter: 'W ciągu trzech miesięcy',
    season: 'W tym sezonie',
    browsing: 'Rozglądam się',
  },
};

/* The search form's free-text wishes (#126), in the order it asks for them. */
export const wishes = [
  ['level', 'Poziom'],
  ['budget', 'Budżet'],
  ['height', 'Wzrost'],
  ['age', 'Wiek'],
  ['when', 'Kiedy'],
];
export const searchHeading = 'Szukają konia spoza listy';

/* Telegram's HTML mode needs only these three escaped. */
export const escape = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* `horseName` is `undefined` for `undecided`. The search form asks no name. */
const greetings = {
  en: (r, horse) =>
    `Hello${r.name ? ` ${r.name.split(/\s/)[0]}` : ''}, this is Hanna Vavilava. Thank you for your enquiry` +
    (horse ? ` about ${horse}.` : '.'),
  // No name: the vocative would need the buyer's gender.
  pl: (r, horse) =>
    'Dzień dobry, tu Hanna Vavilava. Dziękuję za zapytanie' + (horse ? ` o konia ${horse}.` : '.'),
};

/* The stored number is bare (`+48600123456`); wa.me wants the digits alone. */
export const waReply = (record, horseName) =>
  `https://wa.me/${record.whatsapp.slice(1)}?text=${encodeURIComponent(
    greetings[record.locale](record, horseName),
  )}`;

/* The `sendMessage` body, less `chat_id`. */
export function telegramMessage(record, horseName) {
  const r = Object.fromEntries(Object.entries(record).map(([k, v]) => [k, escape(v)]));
  const search = record.kind === 'search';
  const horse = horseName ? `<b>${escape(horseName)}</b>` : 'konia jeszcze nie wybrano';
  const lines = [
    `${search ? searchHeading : `Zapytanie: ${horse}`} · ${record.locale.toUpperCase()}`,
    !search && `${r.name}, ${r.country}`,
    `WhatsApp ${r.whatsapp}` +
      (!r.instagram
        ? ''
        : // The form takes any text here, so only a real handle becomes a link.
          /^[\w.]+$/.test(record.instagram)
          ? ` · Instagram <a href="https://instagram.com/${r.instagram}">@${r.instagram}</a>`
          : ` · Instagram ${r.instagram}`),
    search
      ? wishes
          .filter(([key]) => r[key])
          .map(([key, label]) => `${label}: ${r[key]}`)
          .join(' · ')
      : [
          labels.levels[record.level],
          labels.budgets[record.budget],
          labels.timeframes[record.timeframe],
        ].join(' · '),
    r.note && `„${r.note}”`,
    r.page && `Strona: ${r.page}`,
    `Źródło: ${r.source ?? 'brak'}`,
  ];
  return {
    text: lines.filter(Boolean).join('\n'),
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: {
      inline_keyboard: [[{ text: 'Odpowiedz na WhatsApp', url: waReply(record, horseName) }]],
    },
  };
}
