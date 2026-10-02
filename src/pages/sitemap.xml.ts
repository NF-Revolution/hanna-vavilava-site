import type { APIRoute } from 'astro';
import { locales, htmlLang, type Locale } from '../i18n';
import { path, routes, type RouteKey } from '../i18n/routes';
import { site as facts } from '../site';

/*
 * Every indexable page with its locale pair, the same set the head's hreflang
 * names (E6.4). Horse pages come from `horsesListed`, so a sold horse keeps its
 * page but leaves the sitemap (#23). The menu and the two `noindex` enquiry
 * results stay out.
 */
const skip: RouteKey[] = ['horse', 'menu', 'enquirySent', 'enquiryFailed'];

export const GET: APIRoute = ({ site }) => {
  const pages: { key: RouteKey; slug?: string }[] = [
    ...(Object.keys(routes) as RouteKey[])
      .filter((key) => !skip.includes(key))
      .map((key) => ({ key })),
    ...facts.horsesListed.map((h) => ({ key: 'horse' as const, slug: h.slug })),
  ];
  const href = (l: Locale, key: RouteKey, slug?: string) => new URL(path(l, key, slug), site).href;
  const link = (lang: string, url: string) =>
    `<xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>`;
  const urls = pages.flatMap(({ key, slug }) => {
    const alternates =
      locales.map((l) => link(htmlLang[l], href(l, key, slug))).join('') +
      link('x-default', href(locales[0]!, key, slug));
    return locales.map((l) => `<url><loc>${href(l, key, slug)}</loc>${alternates}</url>`);
  });
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
      urls.join('\n') +
      `\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
