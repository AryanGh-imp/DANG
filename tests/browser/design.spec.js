import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

const themes = ['auto', 'persepolis', 'limestone', 'obsidian', 'lapis', 'cedar', 'porphyry'];
const views = [1, 2, 3, 4];
const fixture = {
  settings: { theme: 'persepolis', unit: 'toman', budget: 6000000, lang: 'fa', cal: 'j' },
  items: [
    { id: 'demo-1', date: '2026-11-08', amt: 185000, cat: 'food', desc: 'ناهار در مسیر خانه' },
    { id: 'demo-2', date: '2026-11-08', amt: 72000, cat: 'move', desc: 'رفت‌وآمد روزانه' },
    { id: 'demo-3', date: '2026-11-08', amt: 340000, cat: 'shop', desc: 'خرید کتاب و دفتر' },
    { id: 'demo-4', date: '2026-11-06', amt: 860000, cat: 'bill', desc: 'اینترنت و قبض تلفن' },
    { id: 'demo-5', date: '2026-11-03', amt: 425000, cat: 'food', desc: 'خرید هفتگی خانه' },
    { id: 'demo-6', date: '2026-10-28', amt: 215000, cat: 'other', desc: 'هزینه‌های دیگر' },
  ],
};

const englishFixture = {
  settings: { ...fixture.settings, lang: 'en', cal: 'g', unit: 'custom', ucustom: 'USD', budget: 600 },
  items: fixture.items.map((item, index) => ({
    ...item, amt: item.amt / 10000,
    desc: ['Lunch on the way home', 'Daily commute', 'Books and stationery', 'Internet and phone bill', 'Weekly groceries', 'Other expenses'][index],
  })),
};

async function start(page, sample = fixture) {
  await page.clock.setFixedTime(new Date('2026-11-08T12:00:00+03:30'));
  await page.goto('/Dang/');
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
  await page.locator('#t4').click();
  await page.locator('.backup-text summary').click();
  await page.locator('#bk').fill(JSON.stringify(sample));
  await page.locator('#bkrest').click();
  await expect(page.locator('#bkmsg')).toContainText(sample.settings.lang === 'en' ? '6' : '۶');
  await page.locator('#t1').click();
  await expect(page.locator('#today .row')).toHaveCount(3);
  await page.evaluate(() => document.fonts.ready);
}

async function assertLayout(page) {
  const result = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const undersized = [...document.querySelectorAll('button, select, summary, .file-picker, .author-link')]
      .filter(e => e.getBoundingClientRect().width && e.getBoundingClientRect().height && getComputedStyle(e).visibility !== 'hidden')
      .filter(e => { const b = e.getBoundingClientRect(); const minimumWidth = e.matches('.cd') ? 24 : 43.5; return b.width < minimumWidth || b.height < 43.5; })
      .map(e => ({ id: e.id, text: e.textContent.slice(0, 30), width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height }));
    const cells = [...document.querySelectorAll('.cd[data-d]')].map(e => e.getBoundingClientRect()).filter(b => b.width);
    const overlap = cells.some((b, i) => cells.slice(i + 1).some(c => Math.min(b.right, c.right) - Math.max(b.left, c.left) > 1 && Math.min(b.bottom, c.bottom) - Math.max(b.top, c.top) > 1));
    return { overflow: document.documentElement.scrollWidth - width, undersized, overlap };
  });
  expect(result.overflow, 'Horizontal page overflow').toBeLessThanOrEqual(1);
  expect(result.undersized, 'Touch controls below their minimum target size').toEqual([]);
  expect(result.overlap, 'Calendar touch targets overlap').toBe(false);
}

test('responsive RTL and English layouts keep all views usable', async ({ page }) => {
  test.setTimeout(90000);
  await start(page);
  await page.locator('#updateBanner').evaluate(element => { element.hidden = false; });
  for (const [width, height] of [[1440, 1000], [1024, 768], [820, 1180], [430, 932], [390, 844], [360, 800], [320, 740], [844, 390]]) {
    await page.setViewportSize({ width, height });
    for (const view of views) {
      await page.locator('#t' + view).click();
      await assertLayout(page);
    }
  }
  await page.locator('#lang').selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  for (const [width, height] of [[1440, 1000], [390, 844], [320, 740]]) {
    await page.setViewportSize({ width, height });
    for (const view of views) {
      await page.locator('#t' + view).click();
      await assertLayout(page);
    }
  }
});

test('all themes and expense dialog meet automated WCAG AA checks', async ({ page }) => {
  test.setTimeout(120000);
  await start(page);
  await page.locator('#updateBanner').evaluate(element => { element.hidden = false; });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of themes) {
    await page.locator('#t4').click();
    await page.locator('#themes [data-k="' + theme + '"]').click();
    for (const view of views) {
      await page.locator('#t' + view).click();
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(result.violations, theme + ' view ' + view).toEqual([]);
    }
  }
  await page.locator('#t1').click();
  await page.locator('#today .row').first().click();
  await assertLayout(page);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.locator('#md')).toBeHidden();
});

test('navigation history and backup draft survive view changes', async ({ page }) => {
  await start(page);
  await page.locator('#t4').click();
  await page.locator('#bk').fill('{"draft":true}');
  await page.locator('#t3').click();
  await expect(page).toHaveURL(/view=report/);
  await page.goBack();
  await expect(page.locator('#v4')).toBeVisible();
  await expect(page.locator('#bk')).toHaveValue('{"draft":true}');
  await page.goForward();
  await expect(page.locator('#v3')).toBeVisible();
});

test('long descriptions, category names and large amounts remain readable', async ({ page }) => {
  await start(page);
  await page.locator('#t4').click();
  await page.locator('#bk').fill(JSON.stringify({
    settings: { unit: 'custom', ucustom: 'واحد پول سفارشی با نام بلند', cats: [{ k: 'long', n: 'دسته‌ای با نام طولانی برای هزینه‌های روزمره', c: '#805b2b' }, { k: 'other', c: '#77746b' }] },
    items: [{ id: 'long', date: '2026-11-08', cat: 'long', amt: 1000000000000, desc: 'شرح هزینهٔ طولانی با متن فارسی و English. '.repeat(10) }],
  }));
  await page.locator('#bkrest').click();
  await expect(page.locator('#bkmsg')).toContainText('۱');
  for (const [width, height] of [[320, 740], [390, 844], [1440, 1000]]) {
    await page.setViewportSize({ width, height });
    for (const view of views) {
      await page.locator('#t' + view).click();
      await assertLayout(page);
      const clipped = await page.locator('.overview-amount, .overview-details, .row, .total, .stat').evaluateAll(elements => elements.filter(e => e.getBoundingClientRect().width && e.scrollWidth > e.clientWidth + 1).map(e => e.className));
      expect(clipped, 'Text must fit its container').toEqual([]);
    }
  }
});

test('capture localized desktop and phone viewport previews', async ({ page, browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Publish one consistent screenshot set');
  test.setTimeout(90000);
  await start(page);
  async function capture(target, lang) {
    const path = 'docs/previews/' + lang;
    await mkdir(path, { recursive: true });
    await expect(target.locator('html')).toHaveAttribute('lang', lang);
    await expect(target.locator('#calsel')).toHaveValue(lang === 'en' ? 'g' : 'j');
    await expect(target.locator('#status')).toBeHidden();
    await target.setViewportSize({ width: 1440, height: 1080 });
    await target.evaluate(() => window.scrollTo(0, 0));
    await target.screenshot({ path: path + '/desktop.png', fullPage: true });
    if (lang === 'fa') await target.locator('.author-link').screenshot({ path: 'docs/previews/author-badge.png' });
    await target.setViewportSize({ width: 390, height: 844 });
    await target.evaluate(() => window.scrollTo(0, 0));
    await target.screenshot({ path: path + '/mobile-entry.png', fullPage: false });
    await target.locator('#t2').click();
    await target.evaluate(() => window.scrollTo(0, 0));
    await assertLayout(target);
    const navigation = await target.locator('#navigation').boundingBox();
    expect(navigation.y).toBeGreaterThan(734);
    expect(navigation.y + navigation.height).toBeLessThanOrEqual(844);
    await target.screenshot({ path: path + '/mobile.png', fullPage: false });
    await target.locator('#t4').click();
    await target.locator('[data-k="obsidian"]').click();
    await target.locator('#t1').click();
    await target.setViewportSize({ width: 1440, height: 1080 });
    await expect(target.locator('#status')).toBeHidden();
    await target.evaluate(() => window.scrollTo(0, 0));
    await target.screenshot({ path: path + '/imperial-dark.png', fullPage: true });
    if (lang === 'fa') await target.locator('.author-link').screenshot({ path: 'docs/previews/author-badge-dark.png' });
    await target.locator('#t3').click();
    await target.evaluate(() => window.scrollTo(0, 0));
    await target.screenshot({ path: path + '/report.png', fullPage: true });
  }
  await capture(page, 'fa');
  const englishContext = await browser.newContext({ locale: 'en-US', viewport: { width: 390, height: 844 } });
  try {
    const englishPage = await englishContext.newPage();
    await start(englishPage, englishFixture);
    await capture(englishPage, 'en');
  } finally {
    await englishContext.close();
  }
});
