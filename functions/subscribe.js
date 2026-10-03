/*
 * The new-horse list (E5.9, #48): the signup the horses index and a sold horse's page
 * post, the two emails it sends, and where every answer lands. Electronic marketing,
 * so the opt-in is its own form with an unticked box, a stored timestamp at both ends
 * of the double opt-in, and an unsubscribe in every message.
 *
 * ponytail: the site's base, its paths, the operator and the addresses mirror
 * `src/site.ts` and `src/i18n/routes.ts`, because `functions/` deploys on its own and
 * cannot import `src/`. #63 changes the domain.
 */
import { z } from 'zod';

export const base = 'https://hanna-vavilava-site.web.app';
export const from = 'Hanna Vavilava <konie@nfrevolution.com>';
export const replyTo = 'kontakt@nfrevolution.com';
const operator = 'CEWET TAS sp. z o.o., ul. Kąty Grodziskie 19J lok. 5, 03-289 Warszawa';

/* An unconfirmed signup expires after this, and `subscribersCleanup` deletes it. */
export const confirmWindow = 7 * 24 * 60 * 60 * 1000;

const routes = {
  sent: { pl: '/powiadomienia/sprawdz', en: '/en/new-horses/check' },
  confirm: { pl: '/powiadomienia/potwierdz', en: '/en/new-horses/confirm' },
  confirmed: { pl: '/powiadomienia/zapisano', en: '/en/new-horses/confirmed' },
  unsubscribe: { pl: '/powiadomienia/wypisz', en: '/en/new-horses/unsubscribe' },
  unsubscribed: { pl: '/powiadomienia/wypisano', en: '/en/new-horses/unsubscribed' },
  failed: { pl: '/powiadomienia/niezapisano', en: '/en/new-horses/failed' },
  horse: { pl: '/konie', en: '/en/horses' },
};

/* Chosen from `locale`, never taken from the request, so no answer is an open redirect. */
export const paths = (locale) =>
  Object.fromEntries(Object.entries(routes).map(([k, v]) => [k, v[locale === 'en' ? 'en' : 'pl']]));

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  // The box is unticked by default and `required` in the form; only a tick sends `yes`.
  consent: z.literal('yes'),
  locale: z.enum(['pl', 'en']),
});

export function parseSignup(body) {
  const parsed = signupSchema.safeParse(body ?? {});
  return parsed.success ? { email: parsed.data.email, locale: parsed.data.locale } : null;
}

/* The token goes in the fragment, which reaches no server log; the page's button posts it. */
const link = (locale, page, token) => `${base}${paths(locale)[page]}#${token}`;
export const oneClickUrl = (token) => `${base}/api/notify/unsubscribe?t=${token}`;

export function confirmEmail(locale, token) {
  const url = link(locale, 'confirm', token);
  return locale === 'en'
    ? {
        subject: 'Confirm: new horses from Hanna Vavilava',
        text: [
          'Someone, hopefully you, asked to be told by email when Hanna Vavilava has a new horse for sale.',
          '',
          `Confirm here: ${url}`,
          '',
          'If it was not you, ignore this message. Nothing is sent without the confirmation, and the address is deleted after 7 days.',
          '',
          operator,
        ].join('\n'),
      }
    : {
        subject: 'Potwierdź: powiadomienia o nowych koniach — Hanna Vavilava',
        text: [
          'Ktoś, mamy nadzieję, że Pan lub Pani, poprosił o wiadomość e-mail, kiedy Hanna Vavilava ma nowego konia na sprzedaż.',
          '',
          `Proszę potwierdzić tutaj: ${url}`,
          '',
          'Jeśli to pomyłka, proszę zignorować tę wiadomość. Bez potwierdzenia nic nie wyślemy, a adres usuniemy po 7 dniach.',
          '',
          operator,
        ].join('\n'),
      };
}

/* `horses` are `{ slug, name }`, one email for however many arrived in one publish. */
export function announceEmail(locale, horses, token) {
  const names = horses.map((h) => h.name).join(', ');
  const list = horses.map((h) => `${h.name}: ${base}${paths(locale).horse}/${h.slug}`);
  const unsubscribe = link(locale, 'unsubscribe', token);
  return locale === 'en'
    ? {
        subject: `New horse for sale: ${names}`,
        text: [
          ...list,
          '',
          '—',
          'You get this because you signed up for new-horse emails at hanna-vavilava-site.web.app.',
          `Unsubscribe: ${unsubscribe}`,
          operator,
        ].join('\n'),
      }
    : {
        subject: `Nowy koń na sprzedaż: ${names}`,
        text: [
          ...list,
          '',
          '—',
          'Ta wiadomość przychodzi, bo zapisał się Pan lub Pani na powiadomienia o nowych koniach na hanna-vavilava-site.web.app.',
          `Wypisz się: ${unsubscribe}`,
          operator,
        ].join('\n'),
      };
}

/*
 * The horses to announce: available now and never announced. The first run has no
 * `/announced` at all, so it marks the current stock and sends nothing.
 */
export function toAnnounce(horses, announced) {
  const entries = Object.entries(horses ?? {}).filter(([, h]) => h);
  if (!announced)
    return { seed: entries.filter(([, h]) => h.status !== 'sold').map(([s]) => s), fresh: [] };
  return {
    seed: [],
    fresh: entries
      .filter(([slug, h]) => h.status === 'available' && !announced[slug])
      .map(([slug, h]) => ({ slug, name: h.name ?? slug })),
  };
}
