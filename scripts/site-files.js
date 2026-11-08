import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const entryFiles = [
  'index.html', 'app.js', 'store.js', 'i18n.js', 'icons.js', 'themes.js',
  'sw.js', 'manifest.webmanifest', '.nojekyll', 'LICENSE', 'NOTICE',
];

export async function siteFiles() {
  async function walk(directory) {
    const entries = await readdir(resolve(root, directory), { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const path = directory + '/' + entry.name;
      if (entry.isSymbolicLink()) throw new Error('Symlinks cannot be published: ' + path);
      if (entry.isDirectory()) files.push(...await walk(path));
      else if (entry.isFile()) files.push(path);
      else throw new Error('Unsupported file type: ' + path);
    }
    return files;
  }
  return [...entryFiles, ...await walk('assets')].sort();
}
