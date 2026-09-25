import { test } from 'node:test';
import assert from 'node:assert/strict';
import { presign } from '../functions/presign.js';

// AWS's worked example, "Authenticating Requests: Using Query Parameters (AWS Signature Version 4)".
test('a presigned GET matches the AWS example signature', () => {
  const url = presign({
    method: 'GET',
    host: 'examplebucket.s3.amazonaws.com',
    path: 'test.txt',
    region: 'us-east-1',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    expires: 86400,
    now: new Date('2013-05-24T00:00:00Z'),
  });
  assert.equal(
    new URL(url).searchParams.get('X-Amz-Signature'),
    'aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404',
  );
});

test('every header passed is signed', () => {
  const url = presign({
    method: 'PUT',
    host: 'a.r2.cloudflarestorage.com',
    path: 'bucket/horses/cascada/xrays/2026-03-04-1a2b3c4d.pdf',
    region: 'auto',
    accessKeyId: 'id',
    secretAccessKey: 'secret',
    expires: 900,
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment' },
  });
  assert.equal(
    new URL(url).searchParams.get('X-Amz-SignedHeaders'),
    'content-disposition;content-type;host',
  );
});
