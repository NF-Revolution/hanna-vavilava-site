import assert from 'node:assert/strict';
import test from 'node:test';
import { soldXrays } from '../functions/sold.js';

test('only sold horses give up their X-ray files', () => {
  const file = (key) => ({ key, bytes: 1 });
  const horses = {
    a: { status: 'sold', xrays: { files: [file('a/1.pdf'), file('a/2.pdf')] } },
    b: { status: 'available', xrays: { files: [file('b/1.pdf')] } },
    c: { status: 'reserved', xrays: { files: { 1: file('c/1.pdf') } } },
    d: { status: 'sold', xrays: { count: 3 } },
    e: { status: 'sold' },
    f: { status: 'sold', xrays: { files: { 3: file('f/1.pdf') } } },
  };
  assert.deepEqual(soldXrays(horses), [
    { slug: 'a', key: 'a/1.pdf' },
    { slug: 'a', key: 'a/2.pdf' },
    { slug: 'f', key: 'f/1.pdf' },
  ]);
  assert.deepEqual(soldXrays(null), []);
});
