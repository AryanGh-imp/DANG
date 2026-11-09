// Run before the body is parsed. Only display preferences are mirrored here.
(() => {
  const root = document.documentElement;
  const path = new URL('./', location.href).pathname;
  const key = 'dang-display:' + path;
  const browserLanguage = (navigator.languages?.length ? navigator.languages : [navigator.language])
    .filter(value => typeof value === 'string').map(value => value.toLowerCase().split(/[-_]/)[0])
    .find(value => value === 'fa' || value === 'en') || 'en';
  const defaults = { lang: browserLanguage, cal: browserLanguage === 'fa' ? 'j' : 'g', theme: 'auto', hasBudget: false };
  const aliases = { light: 'persepolis', dark: 'obsidian', amoled: 'obsidian', ocean: 'lapis', midnight: 'lapis', rose: 'porphyry', sepia: 'persepolis', forest: 'cedar' };
  const themes = ['auto', 'persepolis', 'limestone', 'obsidian', 'lapis', 'cedar', 'porphyry'];
  function display(settings) {
    if (!settings || !['fa', 'en'].includes(settings.lang)) return null;
    const theme = aliases[settings.theme] || settings.theme;
    return { lang: settings.lang, cal: ['j', 'g'].includes(settings.cal) ? settings.cal : 'j',
      theme: themes.includes(theme) ? theme : 'auto', hasBudget: settings.hasBudget === true || Number(settings.budget) > 0 };
  }
  let initial = defaults;
  function readDisplay(name) {
    try { return display(JSON.parse(localStorage.getItem(name))); }
    catch { return null; } // Restricted or malformed hints cannot block startup.
  }
  initial = readDisplay(key) || readDisplay('expenses-settings-v1') || defaults;
  let finished = false;
  const labels = new Set();
  function paint(settings) {
    if (finished) return;
    initial = settings;
    root.lang = settings.lang;
    root.dir = settings.lang === 'fa' ? 'rtl' : 'ltr';
    root.dataset.theme = settings.theme === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'obsidian' : 'persepolis') : settings.theme;
    root.dataset.budget = String(settings.hasBudget);
    for (const element of labels) {
      const text = settings.lang === 'en' ? element.dataset.initialEn : element.dataset.initialFa;
      if (text !== undefined && element.textContent !== text) element.textContent = text;
    }
    const button = document.getElementById('languageSwitch'), label = document.getElementById('languageLabel');
    if (button && label) {
      const language = settings.lang === 'fa' ? 'en' : 'fa';
      button.lang = label.lang = language;
      const text = language === 'en' ? 'English' : 'فارسی';
      if (label.textContent !== text) label.textContent = text;
      button.title = language === 'en' ? 'Switch to English' : 'تغییر زبان به فارسی';
      button.setAttribute('aria-label', button.title);
    }
    const date = document.getElementById('headerDate');
    if (date) {
      const parts = new Intl.DateTimeFormat(settings.lang + '-u-ca-' + (settings.cal === 'j' ? 'persian' : 'gregory'),
        { day: 'numeric', month: 'short', year: 'numeric' }).formatToParts(new Date());
      const text = ['day', 'month', 'year'].map(type => parts.find(part => part.type === type)?.value || '').join(' ');
      if (date.textContent !== text) date.textContent = text;
      for (const element of document.querySelectorAll('[data-initial-date]')) if (element.textContent !== text) element.textContent = text;
    }
    for (const element of document.querySelectorAll('[data-initial-placeholder-en]')) {
      const text = settings.lang === 'en' ? element.dataset.initialPlaceholderEn : element.dataset.initialPlaceholderFa;
      if (element.placeholder !== text) element.placeholder = text;
    }
    for (const [attribute, field] of [['aria-label', 'initialAria'], ['alt', 'initialAlt']]) {
      for (const element of document.querySelectorAll('[data-' + (field === 'initialAria' ? 'initial-aria' : 'initial-alt') + '-en]')) {
        const text = element.dataset[field + (settings.lang === 'en' ? 'En' : 'Fa')];
        if (element.getAttribute(attribute) !== text) element.setAttribute(attribute, text);
      }
    }
    const nav = document.getElementById('navigation');
    if (nav) nav.setAttribute('aria-label', settings.lang === 'fa' ? 'بخش‌های برنامه' : 'App sections');
  }
  const observer = new MutationObserver(records => {
    if (finished) return;
    for (const record of records) for (const node of record.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (node.matches('[data-initial-en]')) labels.add(node);
      for (const element of node.querySelectorAll('[data-initial-en]')) labels.add(element);
    }
    paint(initial);
  });
  observer.observe(document, { childList: true, subtree: true });
  window.dangStartup = {
    get preferences() { return initial; },
    finish() { finished = true; observer.disconnect(); },
    remember(settings) {
      const saved = display(settings);
      if (saved) try { localStorage.setItem(key, JSON.stringify(saved)); } catch { /* IndexedDB remains authoritative. */ }
    },
  };
  paint(initial);
  // Existing v1.0.0 profiles have no display mirror yet. Start their read early,
  // in parallel with CSS/fonts; never create a database or change its schema.
  try {
    const request = indexedDB.open('dang-expenses-v3:' + path, 1);
    request.onupgradeneeded = () => request.transaction.abort();
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('data')) { db.close(); return; }
      const transaction = db.transaction('data', 'readonly');
      const state = transaction.objectStore('data').get('state');
      state.onsuccess = () => { const saved = display(state.result?.settings); if (saved) paint(saved); };
      transaction.oncomplete = transaction.onabort = () => db.close();
    };
    request.onerror = event => event.preventDefault();
  } catch { /* Storage failure is handled by the main app's recovery flow. */ }
})();
