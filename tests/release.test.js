import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { releaseVersion } from '../scripts/release-version.js';

test('published content changes invalidate the cache even when the app version is unchanged', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dang-release-'));
  try {
    await writeFile(join(directory, 'package.json'), JSON.stringify({ version: '1.0.0' }));
    await writeFile(join(directory, 'app.js'), 'old feature');
    await writeFile(join(directory, 'sw.js'), 'worker');
    const original = await releaseVersion(directory, ['app.js', 'sw.js']);
    assert.match(original, /^dang-v1\.0\.0-[a-f0-9]{16}$/);
    assert.equal(await releaseVersion(directory, ['sw.js', 'app.js']), original);
    await writeFile(join(directory, 'README.md'), 'Documentation only');
    assert.equal(await releaseVersion(directory, ['app.js', 'sw.js']), original);
    await writeFile(join(directory, 'app.js'), 'new feature');
    const feature = await releaseVersion(directory, ['app.js', 'sw.js']);
    assert.notEqual(feature, original);
    await writeFile(join(directory, 'sw.js'), 'new worker behavior');
    assert.notEqual(await releaseVersion(directory, ['app.js', 'sw.js']), feature);
    await writeFile(join(directory, 'package.json'), JSON.stringify({ version: '1.1.0' }));
    assert.match(await releaseVersion(directory, ['app.js', 'sw.js']), /^dang-v1\.1\.0-/);
  } finally {
    // The checked target is this test's own temporary directory.
    assert.equal(resolve(directory), join(tmpdir(), directory.split(/[\\/]/).at(-1)));
    await rm(directory, { recursive: true, force: true });
  }
});
