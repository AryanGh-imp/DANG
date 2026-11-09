import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('exact GitHub Pages subpath loads branding, profile and cached expenses', async ({ page, context }) => {
  await page.goto('/DANG/');
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
  await expect(page.locator('.author-link')).toHaveAttribute('href', 'https://github.com/AryanGh-imp');
  await expect(page.locator('.author-link')).toHaveAttribute('rel', /noopener/);
  await expect(page.locator('.hero-emblem img')).toBeVisible();
  await expect.poll(() => page.locator('.hero-emblem img').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  await page.locator('#amt').fill('500');
  await page.locator('#desc').fill('Synthetic deployment test');
  await page.locator('#add').click();
  await expect(page.locator('#amt')).toHaveValue('');
  await expect(page.locator('#offlinemsg')).toHaveText('نسخهٔ آفلاین آماده است.');
  await page.evaluate(async () => { if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })); });
  await context.setOffline(true);
  await page.reload();
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
  await expect(page.locator('#today .row')).toHaveCount(1);
  await expect(page.locator('.author-link')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('16px Vazirmatn', 'فارسی'))).toBe(true);
});

test('release artifact excludes repository metadata, dependencies and backup examples', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'pages', 'Checks the assembled production artifact');
  for (const path of ['package.json', 'node_modules/@playwright/test/package.json', '.git/config', 'README.md', 'examples/sample-backup.json', '.github/workflows/pages.yml']) {
    expect((await request.get('/DANG/' + path)).status()).toBe(404);
  }
  for (const path of ['LICENSE', 'NOTICE', 'assets/fonts/OFL-Vazirmatn.txt', 'manifest.webmanifest']) {
    expect((await request.get('/DANG/' + path)).status()).toBe(200);
  }
  const worker = await (await request.get('/DANG/sw.js')).text();
  const { version } = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  expect(worker.match(/const VERSION = 'dang-v(.+)-([a-f0-9]{16})';/)?.[1]).toBe(version);
});
