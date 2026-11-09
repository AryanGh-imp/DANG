import { test, expect } from '@playwright/test';

async function start(page) {
  await page.goto('/Dang/');
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
}

async function settings(page) {
  return page.evaluate(async () => {
    const { ExpenseStore } = await import('./store.js');
    const store = new ExpenseStore('dang-expenses-v3:' + new URL('./', location.href).pathname);
    await store.open();
    const state = await store.read();
    store.close();
    return state.settings;
  });
}

for (const [locale, lang, cal] of [['en-US', 'en', 'g'], ['en-GB', 'en', 'g'], ['fa-IR', 'fa', 'j'], ['fr-FR', 'en', 'g']]) {
  test.describe('First visit: ' + locale, () => {
    test.use({ locale });
    test('opens in a readable language with matching initial calendar', async ({ page }) => {
      await start(page);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('html')).toHaveAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
      await expect(page.locator('#pageTitle')).toHaveText(lang === 'fa' ? 'دفتر هزینه‌ها' : 'Expense ledger');
      await expect(page.locator('#languageLabel')).toHaveText(lang === 'fa' ? 'English' : 'فارسی');
      await expect(page.locator('#languageSwitch')).toHaveAttribute('lang', lang === 'fa' ? 'en' : 'fa');
      await expect(page.locator('#languageSwitch')).toHaveAccessibleName(lang === 'fa' ? 'Switch to English' : 'تغییر زبان به فارسی');
      expect((await settings(page)).cal).toBe(cal);
      await page.reload();
      expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    });
  });
}

test.describe('Language switching from an English browser', () => {
  test.use({ locale: 'en-US' });

  test('header switch preserves the draft, date, calendar and saved choice', async ({ page, context }) => {
    await start(page);
    await page.setViewportSize({ width: 320, height: 740 });
    await page.locator('#amt').fill('12.50');
    await page.locator('#desc').fill('Unsaved draft');
    await page.locator('#dpAdd .y').selectOption('2024');
    await page.locator('#dpAdd .m').selectOption('2');
    await page.locator('#dpAdd .d').selectOption('29');
    await page.locator('#languageSwitch').press('Enter');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
    await expect(page.locator('#v1')).toBeVisible();
    await expect(page.locator('#amt')).toHaveValue('12.50');
    await expect(page.locator('#desc')).toHaveValue('Unsaved draft');
    await expect(page.locator('#dpAdd .d')).toHaveValue('29');
    await expect(page.locator('#dpAdd .m')).toHaveValue('2');
    await expect(page.locator('#dpAdd .y')).toHaveValue('2024');
    expect((await settings(page)).cal).toBe('g');
    await expect(page.locator('#offlinemsg')).toHaveText('نسخهٔ آفلاین آماده است.');
    await page.evaluate(async () => { if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })); });
    await context.setOffline(true);
    await page.reload();
    expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
    for (const view of [1, 2, 3, 4]) {
      await page.locator('#t' + view).click();
      await expect(page.locator('#languageSwitch')).toBeVisible();
    }
    await page.locator('#languageSwitch').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#lang')).toHaveValue('en');
    expect((await settings(page)).cal).toBe('g');
    await page.locator('#lang').selectOption('fa');
    await expect(page.locator('#languageLabel')).toHaveText('English');
  });

  test('legacy Persian preference takes precedence over browser English', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('expenses-settings-v1', JSON.stringify({ lang: 'fa', cal: 'j' }));
      localStorage.setItem('expenses-v1', JSON.stringify([{ id: 'legacy', date: '2026-11-09', amt: 100, cat: 'food' }]));
    });
    await start(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
    await expect(page.locator('#languageLabel')).toHaveText('English');
    expect((await settings(page)).cal).toBe('j');
    await page.locator('#languageSwitch').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect((await settings(page)).cal).toBe('j');
    await page.reload();
    expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('failed language save keeps the current language and expense draft', async ({ page }) => {
    await start(page);
    await page.locator('#amt').fill('100');
    await page.locator('#desc').fill('Keep this draft');
    await page.evaluate(async () => { const { ExpenseStore } = await import('./store.js'); ExpenseStore.prototype.change = async () => { throw new DOMException('Forced quota error', 'QuotaExceededError'); }; });
    await page.locator('#languageSwitch').click();
    await expect(page.locator('#status')).toContainText('Nothing was saved');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#languageLabel')).toHaveText('فارسی');
    await expect(page.locator('#amt')).toHaveValue('100');
    await expect(page.locator('#desc')).toHaveValue('Keep this draft');
  });
});
