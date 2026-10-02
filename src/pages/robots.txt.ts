import type { APIRoute } from 'astro';
import { indexable } from '../site';

/*
 * A throwaway build keeps the same rules and drops only the sitemap: its pages
 * carry `noindex`, and a crawler blocked here could never read it (E6.4).
 */
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nDisallow: /admin\n` +
      (indexable ? `\nSitemap: ${new URL('/sitemap.xml', site).href}\n` : ''),
  );
