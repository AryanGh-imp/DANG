import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { ExpenseStore, defaultSettings, validateBackup, mergeBackup, parseAmount,
  normaliseSearch, normaliseItems, validDate, sumAmounts, uid } from '../store.js';

const expense = (overrides = {}) => ({ id: uid(), date: '2026-11-07', amt: 120000, desc: 'ناهار', cat: 'food', ...overrides });
async function opened(name = 'test', factory = new IDBFactory(), legacy = {}) { const store = new ExpenseStore(name, factory); await store.open(legacy); return store; }

test('amounts accept valid grouping/decimals and reject destructive coercion', () => {
  for (const [text, number] of [['۱۲۰٬۰۰۰', 120000], ['١٢٠٠٠٠', 120000], ['12.50', 12.5], ['۱٫۲۵', 1.25], ['120 000', 120000], ['0.01', 0.01]]) assert.equal(parseAmount(text), number);
  for (const text of ['-100', 'abc1', '12,50', '1.234', 'Infinity', '9'.repeat(400), '', '0', '1,2,3', '.1']) assert.equal(parseAmount(text), null, text);
  assert.equal(parseAmount('0', true), 0);
  assert.equal(sumAmounts([{ amt: .1 }, { amt: .2 }]), .3);
});
test('dates validate format, month lengths and leap days', () => {
  for (const date of ['2024-02-29', '2026-11-07']) assert.equal(validDate(date), true);
  for (const date of ['not-a-date', '2025-02-29', '2026-04-31', '2026-13-01', '2026-1-1', '2026-01-00']) assert.equal(validDate(date), false);
});
test('backup rejects invalid dates, amounts, settings and HTML attributes atomically', () => {
  for (const item of [expense({ date: 'invalid' }), expense({ amt: -1 }), expense({ amt: 'abc' }), expense({ amt: null }), expense({ cat: 'x" onclick="alert(1)' })]) assert.throws(() => validateBackup({ items: [item] }));
  assert.throws(() => validateBackup({ items: [], settings: { lang: 'de' } }));
  assert.throws(() => validateBackup({ items: [], settings: { cats: [{ k: 'test', c: '#123456"><img onerror="alert(1)">' }] } }));
  assert.throws(() => validateBackup({ items: [], settings: { cats: [{ k: '__proto__', c: '#123456' }] } }));
  assert.throws(() => validateBackup({ v: 99, items: [] }));
});
test('duplicate/conflicting IDs retain distinct expenses and repeated imports are idempotent', () => {
  const first = expense({ id: '123', amt: 10 }), second = expense({ id: '123', amt: 20 });
  const backup = validateBackup({ v: 2, items: [first, second, first] });
  assert.equal(backup.items.length, 2);
  assert.equal(new Set(backup.items.map(e => e.id)).size, 2);
  const state = { settings: defaultSettings(), items: [] };
  assert.equal(mergeBackup(state, backup), 2);
  assert.equal(mergeBackup(state, backup), 0);
  assert.equal(mergeBackup(state, validateBackup({ v: 2, items: [first, second, first] })), 0);
  const conflicting = validateBackup({ items: [expense({ id: '123', amt: 30 })] });
  assert.equal(mergeBackup(state, conflicting), 1);
  assert.equal(mergeBackup(state, conflicting), 0);
  assert.deepEqual(state.items.map(e => e.amt), [10, 20, 30]);
  const missingId = { date: '2026-11-07', amt: 5 };
  assert.equal(mergeBackup(state, validateBackup({ items: [missingId] })), 1);
  assert.equal(mergeBackup(state, validateBackup({ items: [missingId] })), 0);
});
test('restores all settings while retaining categories of existing expenses', () => {
  const state = { settings: { ...defaultSettings(), cats: [...defaultSettings().cats, { k: 'health', n: 'Health', c: '#112233' }] }, items: [expense({ cat: 'health' })] };
  const settings = { ...defaultSettings(), lang: 'en', cal: 'g', theme: 'midnight', unit: 'custom', ucustom: 'USD', budget: 5000 };
  mergeBackup(state, validateBackup({ items: [], settings }));
  for (const key of ['lang', 'cal', 'theme', 'unit', 'ucustom', 'budget']) assert.equal(state.settings[key], settings[key]);
  assert.ok(state.settings.cats.some(c => c.k === 'health'));
});
test('concurrent tabs apply changes to the latest state without losing expenses', async () => {
  const factory = new IDBFactory(), first = await opened('shared', factory), second = await opened('shared', factory);
  await Promise.all(Array.from({ length: 20 }, (_, i) => (i % 2 ? first : second).change(state => { state.items.push(expense({ id: String(i) })); })));
  await second.change(state => { state.settings.theme = 'dark'; });
  const state = await first.read(); assert.equal(state.items.length, 20); assert.equal(state.settings.theme, 'dark');
  assert.equal(new Set(state.items.map(e => e.id)).size, 20);
  first.close(); second.close();
});
test('failed operation rolls back both expenses and settings', async () => {
  const store = await opened();
  await store.change(state => state.items.push(expense({ id: 'original' })));
  const before = await store.read();
  await assert.rejects(store.change(state => { state.items = []; state.settings.theme = 'dark'; throw new Error('forced-failure'); }));
  assert.deepEqual(await store.read(), before);
  await assert.rejects(store.change(state => { state.items.push(expense({ amt: Infinity })); }));
  assert.deepEqual(await store.read(), before); store.close();
});
test('migration repairs malformed legacy data and keeps the original', async () => {
  const raw = { itemsText: JSON.stringify([expense({ id: 123 }), expense({ date: 'bad' })]), settingsText: '{"lang":"de"}' };
  const store = await opened('legacy', new IDBFactory(), { items: JSON.parse(raw.itemsText), settings: JSON.parse(raw.settingsText), raw });
  const state = await store.read(); assert.equal(state.items.length, 1); assert.equal(state.items[0].id, '123'); assert.equal(state.settings.lang, 'fa');
  assert.deepEqual(await store.read('recovery'), raw);
  await store.change(s => { s.items = []; }); store.close();
});
test('previously migrated data is not imported again after deletion', async () => {
  const factory = new IDBFactory(), legacy = { items: [expense()], settings: defaultSettings() };
  const first = await opened('migration', factory, legacy); await first.change(s => { s.items = []; }); first.close();
  const second = await opened('migration', factory, legacy); assert.equal((await second.read()).items.length, 0); second.close();
});
test('corrupt IndexedDB record is repaired at startup with recovery copy', async () => {
  const factory = new IDBFactory(), first = await opened('corrupt', factory);
  await new Promise((resolve, reject) => { const tx = first.db.transaction('data', 'readwrite'); tx.objectStore('data').put({ settings: { lang: 'de' }, items: [{}] }, 'state'); tx.oncomplete = resolve; tx.onabort = reject; }); first.close();
  const second = new ExpenseStore('corrupt', factory); const result = await second.open();
  assert.equal(result.repaired, true); assert.equal(result.state.settings.lang, 'fa'); assert.deepEqual(result.state.items, []);
  assert.ok((await second.read('recovery')).storedState); second.close();
});
test('blocked/unavailable storage rejects rather than reporting success', async () => {
  await assert.rejects(new ExpenseStore('missing', null).open());
});
test('search normalises both Persian and Arabic digits/letters', () => {
  assert.ok(normaliseSearch('خرید ۱۲ کالا').includes(normaliseSearch('١٢')));
  assert.equal(normaliseSearch('كتاب'), normaliseSearch('کتاب'));
});
test('malformed legacy arrays never reach UI rendering', () => {
  assert.deepEqual(normaliseItems({}, defaultSettings().cats), []);
});
