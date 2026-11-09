import { test as base, expect } from '@playwright/test';
import http from 'node:http';

const beacon = 'https://static.cloudflareinsights.com/beacon.min.js';
const token = '4421e6998bd746868c9720de923cedf2';
let officialScript;
const test = base.extend({
  collector: async ({}, use) => {
    const payloads = [];
    const server = http.createServer(async (request, response) => {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      if (request.method === 'POST') payloads.push(JSON.parse(Buffer.concat(chunks).toString()));
      response.writeHead(204, { 'access-control-allow-origin': request.headers.origin || '*', 'access-control-allow-credentials': 'true', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' });
      response.end();
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try { await use({ url: `http://127.0.0.1:${server.address().port}/rum`, payloads }); }
    finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  },
});
test.use({ locale: 'en-US' });
test.beforeAll(async ({ request }) => {
  const response = await request.get(beacon);
  expect(response.ok(), 'Official analytics script must be reachable for integration verification').toBe(true);
  officialScript = await response.body();
});

test('official beacon tracks history changes and never includes financial data', async ({ page, context, collector }) => {
  const requests = [], errors = [], consoleErrors = [];
  const { payloads } = collector;
  context.on('request', request => requests.push({ url: request.url(), method: request.method(), body: request.postData() || '' }));
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await context.route(beacon, route => route.fulfill({ contentType: 'application/javascript', body: officialScript }));
  // Route only the collector through a real isolated HTTP server. WebKit
  // preflights/sendBeacon need genuine CORS responses rather than route stubs.
  // The official script is unchanged; production keeps its default endpoint.
  await page.addInitScript(endpoint => { window.__cfBeacon = { send: { to: endpoint } }; }, collector.url);
  await page.goto('/Dang/');
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
  await expect(page.locator(`script[src="${beacon}"]`)).toHaveCount(1);
  await expect(page.locator(`script[src="${beacon}"]`)).toHaveAttribute('type', 'module');
  expect(JSON.parse(await page.locator(`script[src="${beacon}"]`).getAttribute('data-cf-beacon'))).toEqual({ token });
  await expect.poll(() => payloads.filter(payload => payload.eventType === 1).length).toBeGreaterThan(0);
  const first = payloads.filter(payload => payload.eventType === 1).length;
  await page.locator('#t2').click();
  await expect.poll(() => payloads.filter(payload => payload.eventType === 1).length).toBeGreaterThan(first);
  await page.locator('#t4').click();
  await page.locator('#cname').fill('QA_PRIVATE_CATEGORY_78123'); await page.locator('#cadd').click();
  await page.locator('#unit').selectOption('custom'); await page.locator('#ucustom').fill('QA_PRIVATE_CURRENCY_87123'); await page.locator('#ucustom').blur();
  await page.locator('#bud').fill('731895.23'); await page.locator('#bud').blur();
  await page.locator('#t1').click();
  await page.locator('#amt').fill('247813.59'); await page.locator('#desc').fill('QA_PRIVATE_EXPENSE_97123'); await page.locator('#add').click();
  await expect(page.locator('#amt')).toHaveValue('');
  await page.locator('#today .row').click(); await page.keyboard.press('Escape');
  await page.locator('#t3').click(); await page.goBack();
  await page.locator('#t4').click(); await page.locator('.backup-text summary').click();
  await page.locator('#bk').fill('{"QA_PRIVATE_BACKUP_17123":true}');
  await page.locator('#t2').click();
  await expect.poll(() => payloads.length).toBeGreaterThan(3);
  const external = requests.filter(request => /^https?:/.test(request.url) && new URL(request.url).origin !== new URL(page.url()).origin);
  expect(external.every(request => request.url === beacon && request.method === 'GET' || request.url === collector.url && ['POST', 'OPTIONS'].includes(request.method))).toBe(true);
  for (const request of external) for (const secret of ['QA_PRIVATE_CATEGORY_78123', 'QA_PRIVATE_CURRENCY_87123', 'QA_PRIVATE_EXPENSE_97123', 'QA_PRIVATE_BACKUP_17123', '247813.59', '731895.23']) expect(request.url + request.body).not.toContain(secret);
  for (const payload of payloads) {
    expect(payload.siteToken).toBe(token);
    for (const key of ['items', 'settings', 'amt', 'desc', 'cats', 'budget', 'backup']) expect(payload).not.toHaveProperty(key);
    expect(payload.location).toBe(new URL('/Dang/', page.url()).href);
  }
  expect(new Set(payloads.filter(payload => payload.eventType === 1).map(payload => payload.pageloadId)).size).toBeGreaterThan(2);
  expect(errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('unavailable analytics cannot block saved expenses or offline navigation', async ({ page, context }) => {
  const errors = [], failed = [], consoleErrors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('requestfailed', request => failed.push(request.url()));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await context.route(beacon, route => route.abort('failed'));
  await page.goto('/Dang/');
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
  await page.locator('#amt').fill('12.50'); await page.locator('#desc').fill('Retained with analytics blocked'); await page.locator('#add').click();
  await expect(page.locator('#amt')).toHaveValue('');
  await expect(page.locator('#offlinemsg')).toHaveText('The offline version is ready.');
  await page.evaluate(async () => { if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })); });
  const cached = await page.evaluate(async () => (await Promise.all((await caches.keys()).map(async name => (await (await caches.open(name)).keys()).map(request => request.url)))).flat());
  expect(cached.some(url => /cloudflare/.test(url))).toBe(false);
  await context.setOffline(true); await page.reload();
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
  await expect(page.locator('#today .row')).toHaveCount(1);
  for (const view of [2, 3, 4, 1]) await page.locator('#t' + view).click();
  expect(errors).toEqual([]);
  expect(failed.every(url => url === beacon)).toBe(true);
  // Browser-generated ERR_FAILED diagnostics for this deliberately blocked
  // optional request are expected; errors from app code/resources are not.
  expect(consoleErrors.every(text => text.startsWith('Failed to load resource:')), JSON.stringify(consoleErrors)).toBe(true);
});
