import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import { icons, svg } from '../icons';

type Name = keyof typeof icons;

export const getStaticPaths = (() =>
  Object.keys(icons).map((icon) => ({ params: { icon } }))) satisfies GetStaticPaths;

/* An ICO may hold a PNG as is: a 6-byte header, one 16-byte directory entry, then the PNG. */
function ico(png: Buffer, size: number): Buffer {
  const head = Buffer.alloc(22);
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(1, 4); // one image
  head.writeUInt8(size, 6);
  head.writeUInt8(size, 7);
  head.writeUInt16LE(1, 10); // colour planes
  head.writeUInt16LE(32, 12); // bits per pixel
  head.writeUInt32LE(png.length, 14);
  head.writeUInt32LE(22, 18); // the PNG starts right after
  return Buffer.concat([head, png]);
}

export const GET: APIRoute = async ({ params }) => {
  const name = params.icon as Name;
  const icon = icons[name];
  const source = svg(icon);
  if (name.endsWith('.svg')) {
    return new Response(source, { headers: { 'Content-Type': 'image/svg+xml' } });
  }
  const png = await sharp(Buffer.from(source)).png().toBuffer();
  return new Response(new Uint8Array(name.endsWith('.ico') ? ico(png, icon.size) : png));
};
