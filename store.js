// All writers read and update one record in an IndexedDB readwrite transaction.
// IndexedDB serializes these transactions across tabs; no stale arrays are saved.
export const MAX_AMOUNT = 1e12;
export const DEFAULT_CATEGORIES = [
  { k: 'food', c: '#956b35' }, { k: 'move', c: '#4d6b89' },
  { k: 'bill', c: '#955b54' }, { k: 'shop', c: '#567660' },
  { k: 'other', c: '#77746b' },
];
const THEMES = ['auto', 'persepolis', 'limestone', 'obsidian', 'lapis', 'cedar', 'porphyry', 'light', 'dark', 'ocean', 'rose', 'sepia', 'forest', 'midnight', 'amoled'];
const SAFE_KEY = /^[A-Za-z0-9_-]{1,100}$/;
const clone = value => JSON.parse(JSON.stringify(value));
export function defaultSettings() {
  return { theme: 'auto', unit: 'none', ucustom: '', cal: 'j', lang: 'fa', budget: 0, uv: 1, cats: clone(DEFAULT_CATEGORIES) };
}
export function uid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
export function toLatin(value) {
  return String(value).replace(/[۰-۹]/g, c => c.charCodeAt(0) - 1776)
    .replace(/[٠-٩]/g, c => c.charCodeAt(0) - 1632);
}
export function validAmount(value, allowZero = false) {
  return typeof value === 'number' && Number.isFinite(value) &&
    value >= (allowZero ? 0 : 0.01) && value <= MAX_AMOUNT &&
    Number.isSafeInteger(Math.round(value * 100)) &&
    Math.abs(value * 100 - Math.round(value * 100)) < 0.001;
}
export function parseAmount(input, allowZero = false) {
  const text = toLatin(input).trim().replace(/٫/g, '.').replace(/[٬\u00a0\u202f ]/g, ',');
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) return null;
  const value = Number(text.replace(/,/g, ''));
  return validAmount(value, allowZero) ? value : null;
}
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  if (y < 1000 || y > 9999 || m < 1 || m > 12 || d < 1) return false;
  return d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
}
export function sumAmounts(items) {
  return items.reduce((sum, item) => sum + Math.round(item.amt * 100), 0) / 100;
}
export function normaliseSearch(text) {
  return toLatin(text).normalize('NFKC').replace(/ي/g, 'ی').replace(/ك/g, 'ک').toLowerCase();
}
function plain(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function safeKey(value) { return typeof value === 'string' && SAFE_KEY.test(value) && !['__proto__', 'constructor', 'prototype'].includes(value); }

export function normaliseSettings(input = {}, strict = false) {
  const out = defaultSettings();
  if (!plain(input)) { if (strict) throw new Error('invalid-settings'); return out; }
  for (const [key, choices] of Object.entries({ theme: THEMES, unit: ['none', 'toman', 'rial', 'custom'], cal: ['j', 'g'], lang: ['fa', 'en'] })) {
    let value = input[key];
    if (key === 'unit') value = ({ 'تومان': 'toman', 'ریال': 'rial' })[value] || value;
    if (value !== undefined) {
      if (choices.includes(value)) out[key] = value;
      else if (strict) throw new Error('invalid-' + key);
    }
  }
  if (input.ucustom !== undefined) {
    if (typeof input.ucustom === 'string' && input.ucustom.length <= 80) out.ucustom = input.ucustom.trim();
    else if (strict) throw new Error('invalid-currency');
  }
  if (input.budget !== undefined) {
    if (validAmount(input.budget, true)) out.budget = input.budget;
    else if (strict) throw new Error('invalid-budget');
  }
  if (input.cats !== undefined) {
    if (!Array.isArray(input.cats) || input.cats.length > 1000) {
      if (strict) throw new Error('invalid-categories');
    } else {
      const seen = new Set(), cats = [];
      for (const c of input.cats) {
        if (!plain(c) || !safeKey(c.k) || seen.has(c.k) ||
          (c.n !== undefined && (typeof c.n !== 'string' || c.n.length > 120)) ||
          (c.c !== undefined && (typeof c.c !== 'string' || !/^#[0-9a-f]{6}$/i.test(c.c)))) {
          if (strict) throw new Error('invalid-category');
          continue;
        }
        seen.add(c.k);
        cats.push({ k: c.k, c: c.c || '#7b8a86', ...(c.n ? { n: c.n.trim() } : {}) });
      }
      if (cats.length) {
        if (!seen.has('other')) cats.push(clone(DEFAULT_CATEGORIES[4]));
        out.cats = cats;
      }
    }
  }
  return out;
}
export function normaliseItems(input, cats, strict = false) {
  if (!Array.isArray(input)) { if (strict) throw new Error('invalid-items'); return []; }
  const seen = new Map(), keys = new Set(cats.map(c => c.k)), items = [];
  for (const [index, item] of input.entries()) {
    if (!plain(item) || !validDate(item.date) || !validAmount(item.amt) ||
      (item.desc !== undefined && (typeof item.desc !== 'string' || item.desc.length > 10000)) ||
      (item.cat !== undefined && !safeKey(item.cat)) ||
      (item.id !== undefined && !safeKey(String(item.id)))) {
      if (strict) throw new Error('invalid-expense');
      continue;
    }
    const entry = { id: item.id === undefined ? 'import-' + index : String(item.id), date: item.date,
      amt: item.amt, desc: item.desc || '', cat: keys.has(item.cat) ? item.cat : 'other' };
    if (seen.has(entry.id)) {
      const previous = seen.get(entry.id);
      if (sameExpense(previous, entry)) continue;
      // Stable within the file, so parsing the same backup again does not create duplicates.
      const base = entry.id.slice(0, 80);
      let suffix = 1;
      while (seen.has(base + '-copy-' + suffix)) suffix++;
      entry.id = base + '-copy-' + suffix;
    }
    seen.set(entry.id, entry);
    items.push(entry);
  }
  const cents = items.reduce((total, e) => total + Math.round(e.amt * 100), 0);
  if (!Number.isSafeInteger(cents)) throw new Error('total-too-large');
  return items;
}
export function sameExpense(a, b) {
  return a.date === b.date && a.amt === b.amt && a.desc === b.desc && a.cat === b.cat;
}
export function validateBackup(data) {
  if (!plain(data) || (data.v !== undefined && ![1, 2, 3].includes(data.v)) || !Array.isArray(data.items)) throw new Error('invalid-backup');
  const settings = data.settings === undefined ? null : normaliseSettings(data.settings, true);
  const cats = settings?.cats || defaultSettings().cats;
  return { settings, items: normaliseItems(data.items, cats, true) };
}
export function mergeBackup(state, backup) {
  if (backup.settings) {
    const oldCats = state.settings.cats;
    state.settings = clone(backup.settings);
    const keys = new Set(state.settings.cats.map(c => c.k));
    // Preserve category metadata used by expenses already on this device.
    for (const c of oldCats) if (!keys.has(c.k)) state.settings.cats.push(c);
  }
  const existing = new Map(state.items.map(e => [e.id, e]));
  let added = 0;
  for (const source of backup.items) {
    const item = clone(source), previous = existing.get(item.id);
    if (previous && sameExpense(previous, item)) continue;
    // A conflicting copy gets its own ID; neither version is silently lost.
    if (previous) item.id = uid();
    // Repeated imports of a conflicting backup should still be idempotent.
    if (state.items.some(e => sameExpense(e, item) && (e.id === source.id || previous))) continue;
    existing.set(item.id, item);
    state.items.push(item);
    added++;
  }
  return added;
}

export class ExpenseStore {
  constructor(name, factory = globalThis.indexedDB) { this.name = name; this.factory = factory; this.db = null; }
  async open(legacy = {}) {
    if (!this.factory) throw new Error('storage-unavailable');
    this.db = await new Promise((resolve, reject) => {
      const request = this.factory.open(this.name, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('data');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('storage-blocked'));
    });
    this.db.onversionchange = () => this.db.close();
    return this.change(state => state, legacy);
  }
  change(operation, legacy = null) {
    return new Promise((resolve, reject) => {
      let transaction;
      try { transaction = this.db.transaction('data', 'readwrite'); } catch (error) { reject(error); return; }
      const store = transaction.objectStore('data'), request = store.get('state');
      let result, failure;
      request.onsuccess = () => {
        try {
          let state = request.result;
          const created = !state;
          let repaired = false;
          if (!state) {
            const settings = normaliseSettings(legacy?.settings);
            let items;
            try { items = normaliseItems(legacy?.items || [], settings.cats); }
            catch { items = []; repaired = true; }
            state = { v: 3, rev: 0, settings, items };
            if (legacy?.raw) store.put(legacy.raw, 'recovery');
          }
          // Recover corrupt records only at startup, retaining the original.
          if (legacy !== null && !created) {
            try {
              const checked = normaliseSettings(state.settings, true);
              normaliseItems(state.items, checked.cats, true);
            } catch {
              const corrupted = state, previous = store.get('recovery');
              previous.onsuccess = () => store.put({ storedState: corrupted, legacy: legacy?.raw, previous: previous.result }, 'recovery');
              const settings = normaliseSettings(state.settings);
              let items;
              try { items = normaliseItems(state.items, settings.cats); } catch { items = []; }
              state = { v: 3, rev: Number.isSafeInteger(state.rev) ? state.rev : 0, settings, items };
              repaired = true;
            }
          }
          // A malformed stored record is never passed into rendering code.
          const settings = normaliseSettings(state.settings, true);
          state = { v: 3, rev: (Number.isSafeInteger(state.rev) ? state.rev : 0) + 1, settings, items: normaliseItems(state.items, settings.cats, true) };
          const value = operation(state);
          state.settings = normaliseSettings(state.settings, true);
          state.items = normaliseItems(state.items, state.settings.cats, true);
          store.put(state, 'state');
          result = { state, value, created, repaired };
        } catch (error) { failure = error; transaction.abort(); }
      };
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => { failure ||= transaction.error; };
      transaction.onabort = () => reject(failure || transaction.error || new Error('storage-failed'));
    });
  }
  read(key = 'state') {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('data', 'readonly');
      const request = transaction.objectStore('data').get(key);
      let result;
      request.onsuccess = () => { result = request.result; };
      transaction.oncomplete = () => resolve(result);
      transaction.onabort = transaction.onerror = () => reject(transaction.error);
    });
  }
  close() { this.db?.close(); }
}
