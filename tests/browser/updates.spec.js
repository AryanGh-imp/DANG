import { test, expect } from './fixtures.js';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
let server, url, edition, failedAsset, activationDelay;
test.use({ locale: 'en-US' });
test.beforeEach(async () => {
  edition = 1; failedAsset = false; activationDelay = false;
  server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (!pathname.startsWith('/DANG/')) throw new Error('invalid-path');
      const file = pathname.slice(6) || 'index.html';
      const path = resolve(root, file);
      if (!path.startsWith(resolve(root) + sep)) throw new Error('invalid-path');
      if (edition === 2 && failedAsset && file === 'assets/branding/icon-32.png') {
        response.writeHead(503); response.end('Simulated incomplete release'); return;
      }
      let content = await readFile(path);
      if (file === 'sw.js') content = Buffer.from(content.toString().replace(/const VERSION = '[^']+';/, `const VERSION = 'dang-test-${edition}';`));
      if (file === 'sw.js' && edition === 2 && activationDelay) content = Buffer.from(content.toString().replace('const names = await caches.keys();', 'await new Promise(resolve => setTimeout(resolve, 1500)); const names = await caches.keys();'));
      if (file === 'app.js' && edition === 2) content = Buffer.from(content.toString().replace("view_add: 'Expense ledger'", "view_add: 'Updated expense ledger'"));
      // A long-lived HTTP cache exposes stale precaching if cache:'reload' is absent.
      response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000' });
      response.end(content);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${server.address().port}/DANG/`;
});
test.afterEach(async () => {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
});
async function start(page) {
  await page.goto(url);
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
  await expect(page.locator('#offlinemsg')).toHaveText('The offline version is ready.');
  await page.evaluate(async () => {
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
}
async function publish(page) {
  edition = 2;
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect(page.locator('#updateBanner')).toBeVisible();
  await expect(page.locator('#pageTitle')).toHaveText('Expense ledger');
}
async function apply(page) {
  await Promise.all([page.waitForEvent('domcontentloaded'), page.locator('#updateApp').click()]);
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
  await expect(page.locator('#pageTitle')).toHaveText('Updated expense ledger');
}

test('a cached release updates with one button while protecting drafts and stored expenses', async ({ page, context }) => {
  await start(page);
  await expect(page.locator('#updateBanner')).toBeHidden();
  await page.locator('#amt').fill('100'); await page.locator('#desc').fill('Saved before update'); await page.locator('#add').click();
  await expect(page.locator('#amt')).toHaveValue('');
  await page.evaluate(() => caches.open('another-project-cache'));
  await page.locator('#amt').fill('12.50'); await page.locator('#desc').fill('Draft to protect');
  await publish(page);
  await page.locator('#updateApp').click();
  await expect(page.locator('#status')).toContainText('save or clear unfinished input');
  await expect(page.locator('#pageTitle')).toHaveText('Expense ledger');
  await expect(page.locator('#amt')).toHaveValue('12.50');
  await expect(page.locator('#desc')).toHaveValue('Draft to protect');
  await page.locator('#add').click(); await expect(page.locator('#amt')).toHaveValue('');
  await apply(page);
  await expect(page.locator('#today .row')).toHaveCount(2);
  await expect(page.locator('#calsel')).toHaveValue('g');
  await expect(page.locator('#updateBanner')).toBeHidden();
  const names = await page.evaluate(() => caches.keys());
  expect(names).toContain('another-project-cache');
  expect(names.some(name => name.endsWith('dang-test-1'))).toBe(false);
  expect(names.some(name => name.endsWith('dang-test-2'))).toBe(true);
  await context.setOffline(true); await page.reload();
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
  await expect(page.locator('#pageTitle')).toHaveText('Updated expense ledger');
  await expect(page.locator('#today .row')).toHaveCount(2);
});

test('an update can be applied offline without reloading another tab with an unfinished draft', async ({ page, context }) => {
  await start(page);
  const second = await context.newPage(); await start(second);
  await second.locator('#amt').fill('777'); await second.locator('#desc').fill('Another tab draft');
  await publish(page);
  await expect(second.locator('#updateBanner')).toBeVisible();
  await context.setOffline(true);
  await apply(page);
  await expect(second.locator('#pageTitle')).toHaveText('Expense ledger');
  await expect(second.locator('#amt')).toHaveValue('777');
  await expect(second.locator('#desc')).toHaveValue('Another tab draft');
  await second.locator('#updateApp').click();
  await expect(second.locator('#status')).toContainText('save or clear unfinished input');
  await second.locator('#amt').fill(''); await second.locator('#desc').fill('');
  await apply(second);
});

test('an incomplete release cannot replace the working offline version', async ({ page, context }) => {
  await start(page);
  await page.locator('#amt').fill('100'); await page.locator('#add').click(); await expect(page.locator('#amt')).toHaveValue('');
  const failedInstall = page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await new Promise(resolve => registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker.addEventListener('statechange', () => { if (worker.state === 'redundant') resolve(); });
    }, { once: true }));
  });
  edition = 2; failedAsset = true;
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await failedInstall;
  await expect(page.locator('#updateBanner')).toBeHidden();
  await context.setOffline(true); await page.reload();
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
  await expect(page.locator('#pageTitle')).toHaveText('Expense ledger');
  await expect(page.locator('#today .row')).toHaveCount(1);
});

test('input started during activation also postpones the page reload', async ({ page }) => {
  await start(page);
  activationDelay = true;
  await publish(page);
  await page.locator('#updateApp').click();
  await page.locator('#amt').fill('200');
  await page.locator('#desc').fill('Started while activating');
  await expect(page.locator('#updateApp')).toBeEnabled();
  await expect(page.locator('#status')).toContainText('save or clear unfinished input');
  await expect(page.locator('#pageTitle')).toHaveText('Expense ledger');
  await expect(page.locator('#amt')).toHaveValue('200');
  await page.locator('#add').click(); await expect(page.locator('#amt')).toHaveValue('');
  await apply(page);
  await expect(page.locator('#today .row')).toHaveCount(1);
});
