/*
 * A SigV4 query-string presign (E2.10) — the URL an S3 client's
 * `getSignedUrl` returns, for R2's S3 endpoint. Every header named here is
 * signed, so the browser must send it with exactly this value: that is what
 * makes `Content-Disposition: attachment` part of the object and not a hope.
 * No imports beyond `node:crypto`, so `npm test` runs it against AWS's own
 * published example.
 *
 * ponytail: `UNSIGNED-PAYLOAD` and no signed `content-length` — the size is
 * the one the admin declared. Sign `content-length` if a non-admin ever uploads.
 */
import { createHash, createHmac } from 'node:crypto';

const hmac = (key, data) => createHmac('sha256', key).update(data).digest();
// RFC 3986: encodeURIComponent leaves !'()* alone, SigV4 does not.
const encode = (s) =>
  encodeURIComponent(s).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );

export function presign({
  method,
  host,
  path: object,
  region,
  accessKeyId,
  secretAccessKey,
  expires,
  headers = {},
  now = new Date(),
}) {
  const date = now.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const day = date.slice(0, 8);
  const scope = `${day}/${region}/s3/aws4_request`;
  const signed = Object.fromEntries(
    Object.entries({ host, ...headers }).map(([k, v]) => [
      k.toLowerCase(),
      String(v).trim().replace(/\s+/g, ' '),
    ]),
  );
  const names = Object.keys(signed).sort();
  const path = '/' + object.split('/').map(encode).join('/');
  const query = Object.entries({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKeyId}/${scope}`,
    'X-Amz-Date': date,
    'X-Amz-Expires': String(expires),
    'X-Amz-SignedHeaders': names.join(';'),
  })
    .map(([k, v]) => `${encode(k)}=${encode(v)}`)
    .sort()
    .join('&');
  const canonical = [
    method,
    path,
    query,
    names.map((n) => `${n}:${signed[n]}\n`).join(''),
    names.join(';'),
    'UNSIGNED-PAYLOAD',
  ].join('\n');
  const toSign = [
    'AWS4-HMAC-SHA256',
    date,
    scope,
    createHash('sha256').update(canonical).digest('hex'),
  ].join('\n');
  const signingKey = [day, region, 's3', 'aws4_request'].reduce(
    (k, part) => hmac(k, part),
    `AWS4${secretAccessKey}`,
  );
  return `https://${host}${path}?${query}&X-Amz-Signature=${createHmac('sha256', signingKey).update(toSign).digest('hex')}`;
}
