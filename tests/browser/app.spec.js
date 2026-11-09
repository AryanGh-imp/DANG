import { test, expect } from './fixtures.js';
async function fillBackup(page, text) {
  if (!await page.locator('#bk').isVisible()) await page.locator('.backup-text summary').click();
  await page.locator('#bk').fill(text);
}

async function start(page, path = '/Dang/') {
  await page.goto(path);
  expect(await page.evaluate(async () => (await import('./app.js')).ready)).toBe(true);
}
async function add(page, amount = '۱۲۰٬۰۰۰', description = 'ناهار') {
  await page.locator('#t1').click(); await page.locator('#amt').fill(amount); await page.locator('#desc').fill(description); await page.locator('#add').click();
  await expect(page.locator('#amt')).toHaveValue('');
}
async function state(page) { return page.evaluate(async () => { const { ExpenseStore } = await import('./store.js'); const store = new ExpenseStore('dang-expenses-v3:' + new URL('./', location.href).pathname); await store.open(); const result = await store.read(); store.close(); return result; }); }

test('add, reload, keyboard edit/delete, focus trap and decimals', async ({ page }) => {
  await start(page); await add(page); await page.reload(); await page.evaluate(async () => (await import('./app.js')).ready);
  const row = page.locator('#today .row'); await expect(row).toHaveCount(1);
  await row.focus(); await page.keyboard.press('Enter'); await expect(page.locator('#eamt')).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(page.locator('#editClose')).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(page.locator('#edel')).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.locator('#editClose')).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.locator('#eamt')).toBeFocused();
  await page.locator('#eamt').fill('12.50'); await page.locator('#esave').click(); await expect(page.locator('#md')).toBeHidden();
  expect((await state(page)).items[0].amt).toBe(12.5);
  await page.locator('#today .row').click(); await page.keyboard.press('Escape'); await expect(page.locator('#md')).toBeHidden();
  page.on('dialog', dialog => dialog.accept()); await page.locator('#today .row').click(); await page.locator('#edel').click(); await expect(page.locator('#today .row')).toHaveCount(0);
});
test('settings-added category appears and matches selected chip', async ({ page }) => {
  await start(page); await page.locator('#t4').click(); await page.locator('#cname').fill('سلامت'); await page.locator('#cadd').click(); await expect(page.locator('#cname')).toHaveValue('');
  await page.locator('#t1').click(); await expect(page.locator('#chips .on')).toHaveText('سلامت'); await add(page);
  const saved = await state(page); expect(saved.settings.cats.find(c => c.k === saved.items[0].cat).n).toBe('سلامت');
});
test('failed write preserves form and previous data', async ({ page }) => {
  await start(page); await add(page, '100', 'original');
  await page.evaluate(async () => { const { ExpenseStore } = await import('./store.js'); ExpenseStore.prototype.change = async () => { throw new DOMException('Forced quota error', 'QuotaExceededError'); }; });
  await page.locator('#amt').fill('200'); await page.locator('#desc').fill('unsaved'); await page.locator('#add').click();
  await expect(page.locator('#status')).toHaveClass(/error/); await expect(page.locator('#amt')).toHaveValue('200'); await expect(page.locator('#desc')).toHaveValue('unsaved'); await expect(page.locator('#today .row')).toHaveCount(1);
});
test('backup rejects malicious data; custom currency stays plain text', async ({ page }) => {
  await start(page); await add(page, '100'); await page.locator('#t4').click();
  for (const bad of [{ items: [{ id: '1', date: 'bad', amt: 10 }] }, { items: [], settings: { cats: [{ k: 'evil', c: '#112233"><img data-xss src=x onerror="window.xss=true">' }] } }]) {
    await fillBackup(page, JSON.stringify(bad)); await page.locator('#bkrest').click(); await expect(page.locator('#bkmsg')).toContainText('معتبر نیست'); expect((await state(page)).items).toHaveLength(1);
  }
  await page.locator('#unit').selectOption('custom'); await expect(page.locator('#ucustom')).toBeVisible(); await page.locator('#ucustom').fill('<img data-xss src=x>'); await page.locator('#ucustom').blur();
  await expect.poll(async () => (await state(page)).settings.ucustom).toBe('<img data-xss src=x>');
  await page.locator('#t3').click(); await expect(page.locator('[data-xss]')).toHaveCount(0); await expect(page.locator('#rep')).toContainText('<img data-xss src=x>');
});
test('backup restores settings, keeps duplicate IDs distinct and repeated imports stable', async ({ page }) => {
  await start(page); await page.locator('#t4').click();
  const date = new Date().toISOString().slice(0, 10);
  const backup = { v: 2, settings: { lang: 'en', cal: 'g', unit: 'custom', ucustom: 'USD', theme: 'midnight', budget: 5000 }, items: [{ id: 123, date, amt: 10 }, { id: 123, date, amt: 20 }] };
  await fillBackup(page, JSON.stringify(backup)); await page.locator('#bkrest').click(); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  let saved = await state(page); expect(saved.items).toHaveLength(2); expect(new Set(saved.items.map(e => e.id)).size).toBe(2); expect(saved.settings.budget).toBe(5000); expect(saved.settings.cal).toBe('g');
  await page.locator('#bkrest').click(); await expect(page.locator('#bkmsg')).toContainText('0 new'); saved = await state(page); expect(saved.items).toHaveLength(2);
});
test('stale tabs retain additions; concurrent edits report a conflict', async ({ page, context }) => {
  await context.addInitScript(() => { delete window.BroadcastChannel; });
  await start(page); const second = await context.newPage(); await start(second);
  await add(page, '100', 'first'); await second.locator('#t4').click(); await second.locator('#themes [data-k="obsidian"]').click();
  await expect.poll(async () => (await state(page)).settings.theme).toBe('obsidian'); expect((await state(page)).items).toHaveLength(1);
  await second.locator('#t1').click(); await expect(second.locator('#today .row')).toHaveCount(1);
  await page.locator('#today .row').click(); await second.locator('#today .row').click();
  await page.locator('#eamt').fill('200'); await page.locator('#esave').click();
  await second.locator('#eamt').fill('300'); await second.locator('#esave').click(); await expect(second.locator('#status')).toContainText('تب دیگری'); expect((await state(page)).items[0].amt).toBe(200);
});
test('monthly/custom average, Persian-digit search, CSV and clipboard failures', async ({ page }) => {
  await start(page); await page.locator('#t4').click();
  const backup = { items: [{ id: 'one', date: '2026-11-07', amt: 3000, desc: 'خرید ۱۲ کالا =1+1', cat: 'food' }, { id: 'two', date: '2026-11-07', amt: 100, desc: '=1+1', cat: 'food' }], settings: { lang: 'en', cal: 'g' } };
  await fillBackup(page, JSON.stringify(backup)); await page.locator('#bkrest').click(); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.locator('#t3').click(); await page.locator('#rng').selectOption('202611'); await expect(page.locator('#rep .stats .stat').nth(1)).toContainText('103.33');
  await page.locator('#rng').selectOption('c');
  for (const [id, day] of [['dpFrom', '1'], ['dpTo', '30']]) {
    await page.locator('#' + id + ' .y').selectOption('2026'); await page.locator('#' + id + ' .m').selectOption('11'); await page.locator('#' + id + ' .d').selectOption(day);
  }
  await expect(page.locator('#rep .stats .stat').nth(1)).toContainText('103.33');
  await page.locator('#q').fill('١٢'); await expect(page.locator('#rep .row')).toHaveCount(1);
  await page.locator('#q').fill(''); const downloadEvent = page.waitForEvent('download'); await page.locator('#csv').click(); const download = await downloadEvent;
  const { readFile } = await import('node:fs/promises'); const csv = await readFile(await download.path(), 'utf8'); expect(csv).toContain('"\'=1+1"');
  await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('denied'); } }, configurable: true }); document.execCommand = () => false; });
  await page.locator('#copy').click(); await expect(page.locator('#status')).toContainText('Copy failed'); await expect(page.locator('#copy')).not.toHaveText('Copied ✓');
});
test('migration retains originals; broken legacy values do not break startup', async ({ page }) => {
  await page.addInitScript(() => { if (!localStorage.getItem('seeded')) { localStorage.setItem('expenses-v1', JSON.stringify([{ id: 123, date: '2026-11-07', amt: 100 }, { date: 'bad', amt: 1 }])); localStorage.setItem('expenses-settings-v1', '{"lang":"de"}'); localStorage.setItem('seeded', '1'); } });
  await start(page); expect((await state(page)).items).toHaveLength(1); await expect(page.locator('#status')).toContainText('نامعتبر');
  await page.locator('#t4').click(); await expect(page.locator('#recovery')).toBeVisible();
  await page.reload(); await page.evaluate(async () => (await import('./app.js')).ready); expect((await state(page)).items).toHaveLength(1);
});
test('Pages subpath works offline on a fresh page; root storage is isolated', async ({ page, context }) => {
  await start(page); await add(page, '500');
  await expect(page.locator('#offlinemsg')).toHaveText('نسخهٔ آفلاین آماده است.');
  await page.evaluate(async () => { if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })); });
  await context.setOffline(true); const offline = await context.newPage(); await start(offline); await expect(offline.locator('#today .row')).toHaveCount(1); await add(offline, '250');
  await context.setOffline(false); const root = await context.newPage(); await start(root, '/'); expect((await state(root)).items).toHaveLength(0); expect((await state(offline)).items).toHaveLength(2);
});
test('print preview is escaped, paginated, and reports print failure', async ({ page, browserName }, testInfo) => {
  await start(page); await add(page, '100', 'ناهار <script>window.xss=true</script>'); await page.locator('#t3').click();
  await page.evaluate(() => { window.print = () => { throw new Error('forced'); }; }); await page.locator('#pdf').click();
  await expect(page.locator('#printView')).toBeVisible(); await expect(page.locator('#printMessage')).toContainText('خروجی آماده نشد'); await expect(page.locator('#printView script')).toHaveCount(0);
  await expect(page.locator('#printNow')).toBeEnabled();
  await page.screenshot({ path: testInfo.outputPath('print-preview.png'), fullPage: true });
  await page.locator('#printClose').click(); await expect(page.locator('#t3')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('report-mobile.png'), fullPage: true });
  await page.locator('#t4').click();
  const backup = { settings: { lang: 'fa', cal: 'j' }, items: Array.from({ length: 80 }, (_, i) => ({ id: 'row-' + String(i).padStart(3, '0'), date: '2026-11-07', amt: i + 1, cat: 'food', desc: 'ROW_' + String(i).padStart(3, '0') + ' هزینهٔ روزانه برای خرید خوراک و رفت‌وآمد' })) };
  backup.items.push({ id: 'zz-long', date: '2026-11-07', amt: 10, cat: 'food', desc: 'START_LONG ' + 'شرح هزینهٔ بلند برای بررسی شکست صفحه و خوانایی گزارش. '.repeat(140) + ' END_LONG' });
  await fillBackup(page, JSON.stringify(backup)); await page.locator('#bkrest').click(); await expect(page.locator('#bkmsg')).toContainText('۸۱');
  await page.locator('#t3').click(); await page.locator('#pdf').click();
  if (browserName === 'chromium') await page.pdf({ path: testInfo.outputPath('report.pdf'), preferCSSPageSize: true, printBackground: true });
});

test('calendar/language changes preserve leap and year-boundary dates', async ({ page }) => {
  await start(page);
  for (const [index, iso] of ['2024-02-29', '2025-03-20', '2025-03-21', '2026-03-20', '2026-03-21'].entries()) {
    await page.locator('#t4').click(); await page.locator('#calsel').selectOption('g'); await expect(page.locator('#calsel')).toHaveValue('g');
    await page.locator('#t1').click(); const [y, m, d] = iso.split('-').map(Number);
    await page.locator('#dpAdd .y').selectOption(String(y)); await page.locator('#dpAdd .m').selectOption(String(m)); await page.locator('#dpAdd .d').selectOption(String(d));
    await page.locator('#t4').click(); await page.locator('#lang').selectOption(index % 2 ? 'fa' : 'en'); await expect(page.locator('html')).toHaveAttribute('lang', index % 2 ? 'fa' : 'en');
    await page.locator('#calsel').selectOption('j'); await expect(page.locator('#calsel')).toHaveValue('j');
    await add(page, '100', 'boundary-' + index); expect((await state(page)).items.find(e => e.desc === 'boundary-' + index).date).toBe(iso);
  }
});
