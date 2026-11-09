import { test, expect } from './fixtures.js';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { root, siteFiles } from '../../scripts/site-files.js';
import { releaseVersion } from '../../scripts/release-version.js';

test.use({ locale: 'en-US' });
test('actual v1.0.0 upgrades to v1.0.1 while retaining records, recovery and custom settings', async ({ page, context }) => {
  test.setTimeout(90000);
  const old = new Map();
  let edition = 0;
  const version = await releaseVersion(root, await siteFiles());
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (!pathname.startsWith('/DANG/')) throw new Error('invalid-path');
      const file = pathname.slice(6) || 'index.html';
      if (!resolve(root, file).startsWith(resolve(root) + sep) || file.includes('..')) throw new Error('invalid-path');
      let content;
      if (edition === 0) {
        if (!old.has(file)) old.set(file, execFileSync('git', ['show', 'v1.0.0:' + file], { cwd: root, maxBuffer: 10000000, stdio: ['ignore', 'pipe', 'pipe'] }));
        content = old.get(file);
      } else content = await readFile(resolve(root, file));
      if (file === 'sw.js') content = Buffer.from(content.toString().replace(/const VERSION = '[^']+';/, `const VERSION = '${edition === 0 ? 'dang-v1.0.0-f570896dd4b34373' : version}';`));
      response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000' });
      response.end(content);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/DANG/`;
  try {
    await page.addInitScript(() => {
      if (localStorage.getItem('qa-seeded')) return;
      localStorage.setItem('qa-seeded', 'yes');
      localStorage.setItem('expenses-settings-v1', JSON.stringify({ lang: 'en', cal: 'g' }));
      localStorage.setItem('expenses-v1', JSON.stringify([{ id: 'original', date: '2026-11-09', amt: 5.25, cat: 'food', desc: 'Synthetic original recovery record' }]));
    });
    await page.goto(url);
    expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
    await expect(page.locator('#offlinemsg')).toHaveText('The offline version is ready.');
    await page.evaluate(async () => { if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })); });
    await page.locator('#t4').click(); await page.locator('.backup-text summary').click();
    await page.locator('#bk').fill(JSON.stringify({ settings: { lang: 'fa', cal: 'j', theme: 'obsidian', unit: 'custom', ucustom: 'QA currency', budget: 1234.5, cats: [{ k: 'custom', n: 'Synthetic category', c: '#54728b' }, { k: 'other', c: '#77746b' }] }, items: [{ id: 'custom-record', date: '2024-02-29', amt: 10.5, desc: 'Synthetic leap-day expense', cat: 'custom' }] }));
    await page.locator('#bkrest').click(); await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
    async function readState() {
      return page.evaluate(async () => { const { ExpenseStore } = await import('./store.js'); const store = new ExpenseStore('dang-expenses-v3:/DANG/'); await store.open(); const state = await store.read(), recovery = await store.read('recovery'); store.close(); return { items: state.items, settings: state.settings, recovery }; });
    }
    const before = await readState();
    expect(before.items).toHaveLength(2);
    expect(await page.evaluate(() => localStorage.getItem('dang-display:/DANG/'))).toBeNull();
    const downloading = page.waitForEvent('download'); await page.locator('#bkfile').click();
    const backup = await readFile(await (await downloading).path(), 'utf8');
    expect(JSON.parse(backup).items).toEqual(before.items);
    await page.locator('#t1').click(); await page.locator('#amt').fill('99.25'); await page.locator('#desc').fill('Protected upgrade draft');
    edition = 1;
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect(page.locator('#updateBanner')).toBeVisible();
    await page.locator('#updateApp').click();
    await expect(page.locator('#status')).toContainText('ورودی ناتمام');
    await expect(page.locator('#amt')).toHaveValue('99.25');
    await expect(page.locator('#desc')).toHaveValue('Protected upgrade draft');
    await page.locator('#add').click(); await expect(page.locator('#amt')).toHaveValue('');
    const saved = await readState();
    await Promise.all([page.waitForEvent('domcontentloaded'), page.locator('#updateApp').click()]);
    expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
    await expect(page.locator('meta[name="application-version"]')).toHaveAttribute('content', '1.0.1');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
    expect(await readState()).toEqual(saved);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('dang-display:/DANG/')).lang)).toBe('fa');
    const names = await page.evaluate(() => caches.keys());
    expect(names.some(name => name.endsWith(version))).toBe(true);
    expect(names.some(name => name.includes('dang-v1.0.0-'))).toBe(false);
    await context.setOffline(true); await page.reload();
    expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
    expect(await readState()).toEqual(saved);
    await page.locator('#t4').click(); await expect(page.locator('#recovery')).toBeVisible();
    expect(JSON.parse(backup).items).toEqual(before.items);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
