import assert from 'node:assert/strict';
import { mkdir, copyFile, lstat, rm } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { root } from './site-files.js';
import { checkSite } from './check.js';

const files = await checkSite();
const output = resolve(root, 'dist');
// Verify the exact workspace target before any recursive deletion on Windows.
assert.equal(relative(root, output), 'dist');
assert.notEqual(output, resolve(root));
const existing = await lstat(output).catch(error => {
  if (error.code !== 'ENOENT') throw error;
  return null;
});
assert(!existing?.isSymbolicLink(), 'Refusing to replace a linked output directory');
if (existing) assert(existing.isDirectory(), 'dist must be a directory');
await rm(output, { recursive: true, force: true });
for (const file of files) {
  const target = resolve(output, file);
  assert(!relative(output, target).startsWith('..'), 'Invalid release destination');
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(root, file), target);
}
console.log(`Built ${files.length} allowlisted files in dist/. Development files and data backups are excluded.`);
