/*
 * The favicon and app-icon set (E6.5), built from the owner's logo: a laurel
 * wreath around a horse clearing a jump. `logo-mark.svg` is the same paths with
 * the wreath removed and the view cropped to the horse, because at 16–32px the
 * wreath is noise and leaves the horse a few pixels tall. Every size is
 * rasterised from these two files at build time, so nothing drifts.
 */
import logo from './assets/logo.svg?raw';
import mark from './assets/logo-mark.svg?raw';

/* --ground-dark and --ink-inv in tokens.css. CSS cannot reach a PNG, so they are repeated here. */
export const GROUND = '#0E0E0D';
const INK = '#F2F1ED';

interface Icon {
  size: number;
  source: string;
  /* Margin around the logo, in hundredths of the side. */
  pad: number;
  /* Listed in the web manifest. A maskable icon keeps the logo inside the 80% safe circle. */
  purpose?: 'any' | 'maskable';
}

export const icons = {
  'favicon.svg': { size: 32, source: mark, pad: 4 },
  'favicon.ico': { size: 32, source: mark, pad: 4 },
  'apple-touch-icon.png': { size: 180, source: logo, pad: 8 },
  'icon-192.png': { size: 192, source: logo, pad: 8, purpose: 'any' },
  'icon-512.png': { size: 512, source: logo, pad: 8, purpose: 'any' },
  'icon-maskable-512.png': { size: 512, source: logo, pad: 14, purpose: 'maskable' },
} satisfies Record<string, Icon>;

/* The logo is nested as an inner <svg>, so its own viewBox does the fitting. */
export function svg({ size, source, pad }: Icon): string {
  const inner = source
    .replace('fill="#000000"', `fill="${INK}"`)
    .replace(
      '<svg ',
      `<svg x="${pad}" y="${pad}" width="${100 - 2 * pad}" height="${100 - 2 * pad}" `,
    );
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">` +
    `<rect width="100" height="100" fill="${GROUND}"/>${inner}</svg>`
  );
}
