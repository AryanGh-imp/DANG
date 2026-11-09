import { test, expect } from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';

async function recordInitialFrames(page) {
  await page.addInitScript(() => {
    window.initialFrames = [];
    let previous;
    function sample() {
      const title = document.getElementById('pageTitle');
      if (title && title.getBoundingClientRect().width) {
        const frame = { lang: document.documentElement.lang, dir: document.documentElement.dir, title: title.textContent };
        const key = JSON.stringify(frame);
        if (key !== previous) { previous = key; window.initialFrames.push(frame); }
      }
      if (!window.dangInitialized) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await page.route('**/app.js', async route => { await new Promise(resolve => setTimeout(resolve, 500)); await route.continue(); });
}

test('unavailable display-hint storage does not turn successful expense or language writes into failures', async ({ page }) => {
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) { if (key.startsWith('dang-display:')) throw new DOMException('Synthetic quota restriction', 'QuotaExceededError'); return setItem.call(this, key, value); };
  });
  await page.goto('/Dang/'); await page.evaluate(async () => (await import('./app.js')).ready);
  await page.locator('#amt').fill('14.25'); await page.locator('#desc').fill('Saved without a display hint'); await page.locator('#add').click();
  await expect(page.locator('#amt')).toHaveValue('');
  const initial = await page.locator('html').getAttribute('lang');
  await page.locator('#languageSwitch').click();
  await expect(page.locator('html')).toHaveAttribute('lang', initial === 'en' ? 'fa' : 'en');
  expect(await page.evaluate(() => localStorage.getItem('dang-display:/Dang/'))).toBeNull();
  await page.reload(); expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
  await expect(page.locator('#today .row')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang', initial === 'en' ? 'fa' : 'en');
});

test('a corrupt display hint retains valid legacy preferences', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('dang-display:/Dang/', '{invalid');
    localStorage.setItem('expenses-settings-v1', JSON.stringify({ lang: 'fa', cal: 'j' }));
  });
  await recordInitialFrames(page); await page.goto('/Dang/');
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  expect((await page.evaluate(() => { window.dangInitialized = true; return window.initialFrames; })).every(frame => frame.lang === 'fa')).toBe(true);
});

for (const [locale, lang, dir, title] of [['en-US', 'en', 'ltr', 'Expense ledger'], ['fa-IR', 'fa', 'rtl', 'دفتر هزینه‌ها']]) {
  test.describe('Stable first render: ' + locale, () => {
    test.use({ locale });
    test('cold start has the correct language before the application module runs', async ({ page }) => {
      await recordInitialFrames(page);
      await page.goto('/Dang/');
      expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
      const frames = await page.evaluate(() => { window.dangInitialized = true; return window.initialFrames; });
      expect(frames.length).toBeGreaterThan(0);
      expect(frames.every(frame => frame.lang === lang && frame.dir === dir && frame.title === title)).toBe(true);
      const measurement = await page.locator('#dpAdd').boundingBox();
      expect(measurement.height).toBeGreaterThanOrEqual(48);
    });
    test('accessible descriptions follow both initial language and later switching', async ({ page }) => {
      await page.goto('/Dang/');
      await page.evaluate(async () => (await import('./app.js')).ready);
      async function check(current) {
        await expect(page.locator('html')).toHaveAttribute('lang', current);
        await expect(page.locator('.ledger-summary')).toHaveAttribute('aria-label', current === 'en' ? 'Expense summary' : 'خلاصهٔ هزینه‌ها');
        await expect(page.locator('.hero-emblem img')).toHaveAttribute('alt', current === 'en' ? 'DANG engraved warrior emblem' : 'نشان حکاکی‌شدهٔ جنگجوی DANG');
        await expect(page.locator('.author-link')).toHaveAccessibleName('GitHub AryanGh-imp');
        expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
      }
      await check(lang);
      await page.locator('#languageSwitch').click();
      await check(lang === 'en' ? 'fa' : 'en');
    });
    test('saved display preferences override the browser before rendering', async ({ page }) => {
      await page.goto('/Dang/'); await page.evaluate(async () => (await import('./app.js')).ready);
      await page.locator('#languageSwitch').click();
      const saved = lang === 'en' ? 'fa' : 'en';
      await expect(page.locator('html')).toHaveAttribute('lang', saved);
      const mirror = await page.evaluate(() => JSON.parse(localStorage.getItem('dang-display:/Dang/')));
      expect(Object.keys(mirror).sort()).toEqual(['cal', 'hasBudget', 'lang', 'theme']);
      expect(mirror.lang).toBe(saved);
      await recordInitialFrames(page);
      await page.reload(); await page.evaluate(async () => (await import('./app.js')).ready);
      const frames = await page.evaluate(() => { window.dangInitialized = true; return window.initialFrames; });
      expect(frames.length).toBeGreaterThan(0);
      expect(frames.every(frame => frame.lang === saved && frame.dir === (saved === 'fa' ? 'rtl' : 'ltr'))).toBe(true);
    });
  });
}
