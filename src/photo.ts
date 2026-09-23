/*
 * Photo preparation for the admin upload (E2.5), in the browser before any
 * byte leaves it. The canvas re-encode is the privacy step: it writes pixels
 * and nothing else, so the EXIF block — and the GPS position of the yard an
 * iPhone puts in it — never reaches Storage. No Firebase import, so a test
 * can run `fit` under Node.
 *
 * ponytail: decoding is the browser's. Safari reads HEIC, Chrome and Firefox
 * do not, and the panel reports the file; a WASM decoder is the upgrade if
 * Hanna uploads from Chrome straight off an iPhone export.
 */
export const MAX_EDGE = 2400;

/* The scaled size for a long edge of `max`. Never upscales. */
export function fit(width: number, height: number, max = MAX_EDGE): [number, number] {
  const scale = Math.min(1, max / Math.max(width, height));
  return [Math.round(width * scale), Math.round(height * scale)];
}

export async function downscale(file: Blob): Promise<Blob> {
  // `from-image` applies the EXIF rotation before the metadata is dropped.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const [width, height] = fit(bitmap.width, bitmap.height);
  const canvas = new OffscreenCanvas(width, height);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
}

/* Content-addressed, so an object is never overwritten with other bytes and caches forever. */
export async function photoKey(slug: string, blob: Blob): Promise<string> {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()));
  const hex = [...hash.slice(0, 4)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `photos/${slug}/${hex}.jpg`;
}
