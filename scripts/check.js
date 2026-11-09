import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { root, siteFiles } from './site-files.js';
import { validateBackup } from '../store.js';

export async function checkSite() {
  const files = await siteFiles();
  const released = new Set(files);
  const read = file => readFile(resolve(root, file), 'utf8');
  async function localReference(source, reference, publish = false) {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(reference)) return;
    const path = resolve(root, dirname(source), decodeURIComponent(reference.split(/[?#]/)[0]));
    const name = relative(root, path).replaceAll('\\', '/');
    assert(!name.startsWith('../') && !isAbsolute(name), 'Reference escapes repository: ' + reference);
    assert((await stat(path)).isFile(), 'Missing local file: ' + source + ' -> ' + reference);
    if (publish) assert(released.has(name), 'Reference excluded from release: ' + name);
  }
  for (const file of files) {
    assert((await stat(resolve(root, file))).isFile(), 'Not a file: ' + file);
    if (file !== '.nojekyll') assert((await stat(resolve(root, file))).size > 0, 'Empty asset: ' + file);
    if (file.endsWith('.js')) {
      execFileSync(process.execPath, ['--check', resolve(root, file)], { stdio: 'pipe' });
      for (const match of (await read(file)).matchAll(/\bfrom\s+['"](\.[^'"]+)['"]/g)) await localReference(file, match[1], true);
    }
    if (file.endsWith('.css')) {
      for (const match of (await read(file)).matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) await localReference(file, match[1], true);
    }
  }
  const html = await read('index.html');
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) await localReference('index.html', match[1], true);
  assert(html.includes('href="https://github.com/AryanGh-imp"'), 'Missing maintainer profile');
  const manifest = JSON.parse(await read('manifest.webmanifest'));
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert(manifest.icons.some(icon => icon.purpose === 'maskable'), 'Missing maskable icon');
  for (const icon of manifest.icons) {
    await localReference('manifest.webmanifest', icon.src, true);
    const data = await readFile(resolve(root, icon.src));
    assert.equal(data.subarray(1, 4).toString(), 'PNG');
    assert.equal(`${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`, icon.sizes);
  }
  const worker = await read('sw.js');
  const cached = worker.match(/const FILES = \[([\s\S]*?)\];/);
  assert(cached, 'Cannot read service worker precache list');
  const precached = new Set();
  for (const match of cached[1].matchAll(/['"]([^'"]+)['"]/g)) {
    await localReference('sw.js', match[1], true); precached.add(match[1]);
  }
  for (const file of files.filter(file => file.endsWith('.js') && file !== 'sw.js')) {
    assert(precached.has(file), 'Runtime module missing from offline precache: ' + file);
  }
  const docs = ['README.md', 'README.fa.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CHANGELOG.md',
    ...(await readdir(resolve(root, 'docs'))).filter(file => file.endsWith('.md')).map(file => 'docs/' + file)];
  for (const file of docs) {
    const content = await read(file);
    for (const match of content.matchAll(/\]\(([^\s)]+)\)|<img[^>]*src="([^"]+)"/g)) await localReference(file, match[1] || match[2]);
  }
  JSON.parse(await read('schemas/backup.schema.json'));
  validateBackup(JSON.parse(await read('examples/sample-backup.json')));
  for (const file of (await readdir(resolve(root, 'scripts'))).filter(file => file.endsWith('.js'))) {
    execFileSync(process.execPath, ['--check', resolve(root, 'scripts', file)], { stdio: 'pipe' });
  }
  console.log(`Checked syntax, ${files.length} release files, local references, manifest icons, precache and sample backup.`);
  return files;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(root, 'scripts/check.js')) {
  await checkSite();
}
