import { T, MN, WD, MG, WG } from './i18n.js';
import { icon } from './icons.js';
import { THEMES, themeKey, activeTheme } from './themes.js';
import { ExpenseStore, defaultSettings, normaliseSettings, normaliseItems, validateBackup,
  mergeBackup, sameExpense, parseAmount, toLatin, sumAmounts, normaliseSearch, uid } from './store.js';

Object.assign(T.fa, {
  loading: 'در حال خواندن داده‌ها…', saved: 'ذخیره شد ✓',
  storage_error: 'ذخیره انجام نشد. داده‌های قبلی حفظ شدند؛ فضای مرورگر و اجازهٔ ذخیره‌سازی را بررسی کن و دوباره تلاش کن.',
  conflict: 'این هزینه در تب دیگری تغییر کرده است. نسخهٔ تازه را بررسی کن و دوباره تلاش کن.',
  amount_bad: 'مبلغ مثبت و معتبر وارد کن؛ حداکثر دو رقم اعشار و سقف ۱٬۰۰۰٬۰۰۰٬۰۰۰٬۰۰۰.',
  budget_bad: 'بودجه باید صفر یا مبلغ معتبر با حداکثر دو رقم اعشار باشد.',
  amount_note: 'رقم فارسی یا انگلیسی؛ تا دو رقم اعشار.',
  date_bad: 'بازهٔ تاریخ معتبر نیست؛ تاریخ شروع باید پیش از پایان یا برابر آن باشد.',
  day: 'روز', month: 'ماه', year: 'سال', prev_month: 'ماه قبل', next_month: 'ماه بعد',
  cat_color: 'رنگ {name}', edit_item: 'ویرایش: {desc}، {amount}',
  copy_failed: 'کپی انجام نشد. متن را دستی انتخاب و کپی کن یا فایل پشتیبان را دانلود کن.',
  export_failed: 'خروجی آماده نشد. دوباره تلاش کن.',
  bk_file: 'دانلود فایل پشتیبان', bk_open: 'انتخاب فایل پشتیبان',
  bk_settings: 'بازیابی ظاهر، زبان، تقویم، واحد پول و بودجه نیز انجام شود',
  bk_rest: 'بازیابی و ادغام با داده‌های فعلی',
  bk_note: 'داده‌ها روی همین مرورگر ذخیره می‌شوند. فایل پشتیبان را در جای دیگری نگه دار؛ برای انتقال به دستگاه یا دامنهٔ دیگر هم از همین فایل استفاده کن.',
  bk_bad: 'پشتیبان معتبر نیست؛ هیچ داده‌ای تغییر نکرد. مبلغ، تاریخ و دسته‌ها را بررسی کن.',
  recovery_file: 'دانلود نسخهٔ اصلی داده‌های قبلی',
  migrated: 'داده‌های نسخهٔ قبلی منتقل شدند. نسخهٔ اصلی آن‌ها هم در بخش پشتیبان‌گیری قابل دانلود است.',
  legacy_warning: 'بخشی از داده‌های قبلی نامعتبر بود و برای نمایش اصلاح شد. نسخهٔ اصلی را از بخش پشتیبان‌گیری دانلود و بررسی کن.',
  persist: 'درخواست ماندگاری حافظه', persist_yes: 'حافظهٔ ماندگار فعال است. پاک‌کردن دستی داده‌های سایت همچنان آن‌ها را حذف می‌کند؛ پشتیبان بگیر.',
  persist_no: 'مرورگر ماندگاری حافظه را تضمین نکرد. پشتیبان را مرتب نگه دار.',
  persist_na: 'این مرورگر درخواست ماندگاری حافظه را پشتیبانی نمی‌کند؛ پشتیبان بگیر.',
  offline_ready: 'نسخهٔ آفلاین آماده است.', offline_loading: 'در حال آماده‌سازی نسخهٔ آفلاین…',
  offline_na: 'نسخهٔ آفلاین آماده نشد. سایت را با HTTPS یا localhost باز کن و دوباره بارگذاری کن.',
  w_note: 'هزینه‌ها در حافظهٔ مرورگر و فایل‌های برنامه در کش آفلاین هستند. گزینه‌های زیر فقط داده‌ها و تنظیمات را تغییر می‌دهند؛ کش برنامه حفظ می‌شود.',
  avg_note: 'میانگین بر اساس تمام {n} روز بازه محاسبه شده است.',
  month_scope: 'بودجه و مقایسه مربوط به کل ماه هستند؛ جستجو فقط فهرست و جمع نتایج را فیلتر می‌کند.',
  print_hint: 'در پنجرهٔ چاپ، گزینهٔ «ذخیره به‌صورت PDF» را انتخاب کن.',
  print_now: 'چاپ / ذخیره PDF', print_back: 'بازگشت به برنامه',
  w_q3: 'ظاهر، واحد، تقویم و بودجه به حالت اول برگردند؟ هزینه‌ها و دسته‌های مورد استفادهٔ آن‌ها حفظ می‌شوند.',
});
Object.assign(T.en, {
  loading: 'Loading your data…', saved: 'Saved ✓',
  storage_error: 'Nothing was saved. Previous data is kept. Check browser storage access and free space, then retry.',
  conflict: 'This expense changed in another tab. Review the latest version and try again.',
  amount_bad: 'Enter a positive amount with up to two decimal places, at most 1,000,000,000,000.',
  budget_bad: 'Enter zero or a valid budget with up to two decimal places.',
  amount_note: 'Persian or English digits; up to two decimal places.',
  date_bad: 'Invalid date range: the start must be on or before the end.',
  day: 'Day', month: 'Month', year: 'Year', prev_month: 'Previous month', next_month: 'Next month',
  cat_color: '{name} color', edit_item: 'Edit: {desc}, {amount}',
  copy_failed: 'Copy failed. Select and copy the text manually, or download a backup file.',
  export_failed: 'Could not prepare the export. Try again.',
  bk_file: 'Download backup file', bk_open: 'Choose backup file',
  bk_settings: 'Also restore appearance, language, calendar, currency and budget',
  bk_rest: 'Restore and merge with current data',
  bk_note: 'Data is stored in this browser. Keep a backup file somewhere else; use it to transfer data to another device or domain.',
  bk_bad: 'Invalid backup; nothing changed. Check amounts, dates and categories.',
  recovery_file: 'Download original previous data',
  migrated: 'Previous data was migrated. Its original copy is available in Backup and restore.',
  legacy_warning: 'Some previous data was invalid and was repaired for display. Download and inspect the original copy in Backup and restore.',
  persist: 'Request persistent storage', persist_yes: 'Persistent storage is enabled. Manually clearing site data still deletes it; keep backups.',
  persist_no: 'The browser did not grant persistent storage. Keep regular backups.',
  persist_na: 'This browser does not support persistent storage requests. Keep backups.',
  offline_ready: 'The offline version is ready.', offline_loading: 'Preparing the offline version…',
  offline_na: 'The offline version is unavailable. Open the site over HTTPS or localhost and reload.',
  w_note: 'Expenses use browser storage; app files use the offline cache. These actions change only expenses and settings; app files remain cached.',
  avg_note: 'Average across all {n} days in the selected range.',
  month_scope: 'Budget and comparison cover the whole month; search filters the expense list and result totals.',
  print_hint: 'Choose “Save as PDF” in the print dialog.', print_now: 'Print / Save PDF', print_back: 'Back to app',
  w_q3: 'Reset appearance, currency, calendar and budget? Expenses and the categories they use are kept.',
});
Object.assign(T.fa, {
  title: 'دفتر هزینه‌ها', tab_add: 'ثبت هزینه', add: 'ثبت هزینه',
  brand_caption: 'دفتر هزینه‌های شخصی', brand_motto: 'هر هزینه، روشن و ماندگار.',
  device_private: 'خصوصی، روی همین دستگاه', footer_note: 'دفترِ شما، روی دستگاهِ شما.',
  skip_main: 'رفتن به محتوای اصلی', open_calendar: 'باز کردن تقویم', close_edit: 'بستن پنجرهٔ ویرایش',
  view_add: 'دفتر هزینه‌ها', view_calendar: 'تقویم هزینه‌ها', view_report: 'گزارش هزینه‌ها', view_settings: 'تنظیمات',
  subtitle_add: 'هزینه‌های روزانه‌ات را با خیال آسوده ثبت کن.',
  subtitle_calendar: 'روزها و هزینه‌هایشان، در یک نگاه.', subtitle_report: 'ببین پولت کجا و چگونه خرج شده است.',
  subtitle_settings: 'دفترت را به سلیقهٔ خودت تنظیم کن.',
  entry_heading: 'یک هزینهٔ تازه', entry_note: 'مبلغ، دسته و تاریخ را ثبت کن.',
  appearance_heading: 'به رنگِ شما', appearance_note: 'رنگ‌هایی از سنگ، فلز و باغ‌های ایران.',
  categories_note: 'هر هزینه در جای خودش.', backup_short: 'یک نسخه، برای خیال آسوده.',
  bk_text_option: 'بازیابی از متن پشتیبان', bk_loaded: 'فایل آماده است؛ برای ادغام، «بازیابی» را بزن.',
  overview_month: 'هزینه‌های {month}', overview_day: 'این روز', overview_count: 'تعداد هزینه‌های ماه',
  activity_heading: 'هزینه‌های این روز', activity_today: 'هزینه‌های امروز', activity_count: '{n} مورد',
  empty_help: 'هزینهٔ تازه‌ای ثبت کن تا اینجا نمایش داده شود.',
  theme_auto: 'هماهنگ با دستگاه', theme_auto_note: 'روشن یا تیره، مطابق تنظیمات شما',
  theme_persepolis: 'پارسه', theme_persepolis_note: 'سنگ روشن و برنز',
  theme_limestone: 'سنگ‌نوشته', theme_limestone_note: 'آرام، روشن و مینیمال',
  theme_obsidian: 'شاهنشاهی', theme_obsidian_note: 'جوهر تیره و طلایی',
  theme_lapis: 'لاجورد', theme_lapis_note: 'آبی عمیق و طلایی',
  theme_cedar: 'سرو', theme_cedar_note: 'سبز باغ و برنز',
  theme_porphyry: 'ارغوان', theme_porphyry_note: 'بنفش سنگی و مس',
});
Object.assign(T.en, {
  title: 'Expense ledger', tab_add: 'Add expense', add: 'Save expense',
  brand_caption: 'Personal expense ledger', brand_motto: 'Every expense, accounted for.',
  device_private: 'Private, on this device', footer_note: 'Your ledger. Your device.',
  skip_main: 'Skip to main content', open_calendar: 'Open calendar', close_edit: 'Close expense editor',
  view_add: 'Expense ledger', view_calendar: 'Expense calendar', view_report: 'Expense report', view_settings: 'Settings',
  subtitle_add: 'Keep a clear record of your everyday spending.', subtitle_calendar: 'Your days and their expenses, at a glance.',
  subtitle_report: 'Understand where your money goes.', subtitle_settings: 'Make this ledger your own.',
  entry_heading: 'A new expense', entry_note: 'Enter an amount, category and date.',
  appearance_heading: 'Your palette', appearance_note: 'Inspired by the stone, metal and gardens of ancient Persia.',
  categories_note: 'A place for every expense.', backup_short: 'Keep a copy for peace of mind.',
  bk_text_option: 'Restore from backup text', bk_loaded: 'File ready. Select Restore to merge it.',
  overview_month: '{month} expenses', overview_day: 'Selected day', overview_count: 'Expenses this month',
  activity_heading: 'Expenses on this day', activity_today: 'Today’s expenses', activity_count: '{n} items',
  empty_help: 'Save a new expense to see it here.',
  theme_auto: 'Follow device', theme_auto_note: 'Light or dark, following your settings',
  theme_persepolis: 'Persepolis', theme_persepolis_note: 'Warm stone and bronze',
  theme_limestone: 'Limestone', theme_limestone_note: 'Quiet, bright and minimal',
  theme_obsidian: 'Imperial', theme_obsidian_note: 'Dark ink and gold',
  theme_lapis: 'Lapis', theme_lapis_note: 'Deep blue and gold',
  theme_cedar: 'Cedar', theme_cedar_note: 'Garden green and bronze',
  theme_porphyry: 'Porphyry', theme_porphyry_note: 'Stone purple and copper',
});

const $ = id => document.getElementById(id);
let items = [], S = defaultSettings(), cur = 1, curCat = 'food', editId = null, editBase = null;
let returnFocus = null, appliedRevision = -1, recoveryData = null, channel = null;
let offlineKey = 'offline_loading';
let backupDraft = false, statusTimer;
const viewNames = ['add', 'calendar', 'report', 'settings'];
const systemScheme = matchMedia('(prefers-color-scheme: dark)');
document.querySelectorAll('[data-icon]').forEach(el => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)));
const rootPath = new URL('./', location.href).pathname;
const store = new ExpenseStore('dang-expenses-v3:' + rootPath);
const cal = { y: 0, m: 0, sel: null };
const rtl = () => S.lang === 'fa';
function t(key, params = {}) {
  let text = T[S.lang]?.[key] ?? T.fa[key] ?? key;
  for (const [name, value] of Object.entries(params)) text = text.replaceAll('{' + name + '}', String(value));
  return text;
}
function esc(value) { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
const nd = value => rtl() ? String(value).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]) : String(value);
const fa = number => Number(number).toLocaleString(rtl() ? 'fa-IR' : 'en-US', { maximumFractionDigits: 2 });
function ul() { return S.unit === 'none' ? '' : S.unit === 'custom' ? S.ucustom : t('u_' + S.unit); }
const fm = number => fa(number) + (ul() ? ' ' + ul() : '');
const hm = number => esc(fm(number));
const pc = number => nd(Math.round(number)) + (rtl() ? '٪' : '%');
const cmp = n => n >= 1e6 ? nd(+(n / 1e6).toFixed(1)) + 'M' : n >= 1e3 ? nd(Math.round(n / 1e3)) + 'K' : fa(n);
const pad = n => String(n).padStart(2, '0');
const sum = sumAmounts;
function today() { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
const jf = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' });
function J(s) {
  const p = s.split('-'), out = {};
  jf.formatToParts(new Date(+p[0], +p[1] - 1, +p[2], 12)).forEach(x => { out[x.type] = x.value; });
  return { y: +out.year, m: +out.month, d: +out.day };
}
function j2g(jy, jm, jd) {
  jy += 1595;
  let days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097); days %= 146097;
  if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * Math.floor(days / 1461); days %= 1461;
  if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  let gd = days + 1;
  const lengths = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm;
  for (gm = 0; gm < 13; gm++) { if (gd <= lengths[gm]) break; gd -= lengths[gm]; }
  return gy + '-' + pad(gm) + '-' + pad(gd);
}
function dim(y, m) { return S.cal === 'g' ? new Date(y, m, 0).getDate() : m <= 6 ? 31 : m <= 11 ? 30 : J(j2g(y, 12, 30)).m === 12 ? 30 : 29; }
function D(s) { if (S.cal !== 'g') return J(s); const p = s.split('-'); return { y: +p[0], m: +p[1], d: +p[2] }; }
const toIso = (y, m, d) => S.cal === 'g' ? y + '-' + pad(m) + '-' + pad(d) : j2g(y, m, d);
const mn = i => (S.cal === 'g' ? MG : MN)[S.lang][i];
function jstr(s) { const j = D(s); return nd(j.d) + ' ' + mn(j.m - 1) + ' ' + nd(j.y); }
function jlat(s) { const j = J(s); return j.y + '/' + pad(j.m) + '/' + pad(j.d); }
function mkey(s) { const j = D(s); return j.y * 100 + j.m; }
const mname = k => mn(k % 100 - 1) + ' ' + nd(Math.floor(k / 100));
const catOf = k => S.cats.find(c => c.k === k) || S.cats.find(c => c.k === 'other');
const cname = c => c.n || t('cat_' + c.k);
function notify(key, error = false) {
  clearTimeout(statusTimer);
  $('status').textContent = key ? t(key) : '';
  $('status').classList.toggle('error', error);
  $('status').hidden = !key;
  $('status').dataset.kind = key === 'saved' ? 'toast' : error ? 'error' : 'notice';
  if (key === 'saved') statusTimer = setTimeout(() => { $('status').hidden = true; }, 3000);
}
function inputError(id, key) {
  const input = $(id), error = $(id + 'Error');
  if (error) { error.textContent = t(key); error.hidden = false; }
  input.setCustomValidity(t(key)); input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', (id === 'amt' ? 'amountNote ' : '') + id + 'Error'); input.reportValidity(); input.focus();
}
['amt', 'eamt', 'bud'].forEach(id => $(id).addEventListener('input', () => { $(id).setCustomValidity(''); $(id).removeAttribute('aria-invalid'); if ($(id + 'Error')) $(id + 'Error').hidden = true; }));

const pickerIds = ['dpAdd', 'dpEdit', 'dpFrom', 'dpTo'];
function dpInit(id, callback) {
  const el = $(id); el._cb = callback;
  el.innerHTML = ['d', 'm', 'y'].map((key, i) => '<select class="' + key + '" aria-label="' + t(['day', 'month', 'year'][i]) + '"></select>').join('');
  const d = el.querySelector('.d'), m = el.querySelector('.m'), y = el.querySelector('.y'), year = D(today()).y;
  m.innerHTML = (S.cal === 'g' ? MG : MN)[S.lang].map((n, i) => '<option value="' + (i + 1) + '">' + n + '</option>').join('');
  for (let i = year - 6; i <= year + 1; i++) y.add(new Option(nd(i), i));
  el._days = () => { const keep = +d.value || 1, n = dim(+y.value, +m.value); d.innerHTML = ''; for (let i = 1; i <= n; i++) d.add(new Option(nd(i), i)); d.value = Math.min(keep, n); };
  m.onchange = y.onchange = () => { el._days(); callback?.(); };
  d.onchange = () => callback?.(); el._days();
}
function dpSet(id, iso) {
  const el = $(id), j = D(iso), y = el.querySelector('.y');
  if (![...y.options].some(o => +o.value === j.y)) y.add(new Option(nd(j.y), j.y));
  y.value = j.y; el.querySelector('.m').value = j.m; el._days(); el.querySelector('.d').value = j.d;
}
function dpGet(id) { const el = $(id); return toIso(+el.querySelector('.y').value, +el.querySelector('.m').value, +el.querySelector('.d').value); }
function dpReset() {
  const now = today(), j = D(now);
  pickerIds.forEach(id => dpInit(id, id === 'dpAdd' ? renderAdd : id === 'dpFrom' || id === 'dpTo' ? report : null));
  dpSet('dpAdd', now); dpSet('dpEdit', now); dpSet('dpFrom', toIso(j.y, j.m, 1)); dpSet('dpTo', now);
  cal.y = j.y; cal.m = j.m; cal.sel = now;
}
function budHTML(spent, label) {
  if (!S.budget) return '';
  const p = spent / S.budget * 100, c = p > 100 ? 'over' : p >= 80 ? 'warn' : '', left = Math.round((S.budget - spent) * 100) / 100;
  return '<div class="card"><b>' + esc(t('bud', { m: label })) + '</b><div class="prog ' + c + '"><i style="width:' + Math.min(p, 100) + '%"></i></div><div class="bt ' + c + '">' +
    esc(t('bud_l', { s: fm(spent), b: fm(S.budget), p: pc(p), r: t(left >= 0 ? 'left' : 'over', { x: fm(Math.abs(left)) }) })) + '</div></div>';
}
const monthSum = key => sum(items.filter(e => mkey(e.date) === key));
function renderChips() {
  if (!S.cats.some(c => c.k === curCat)) curCat = S.cats[0].k;
  $('chips').innerHTML = S.cats.map(c => '<button type="button" class="chip' + (c.k === curCat ? ' on' : '') + '" aria-pressed="' + (c.k === curCat) + '" data-k="' + esc(c.k) + '"><i class="chip-dot" style="--category-color:' + c.c + '" aria-hidden="true"></i>' + esc(cname(c)) + '</button>').join('') + '<button type="button" class="chip" data-k="+">' + icon('plus') + t('newcat').replace('＋ ', '') + '</button>';
}
function rowHTML(e) {
  const c = catOf(e.cat), description = e.desc || cname(c);
  return '<button type="button" class="row" data-id="' + esc(e.id) + '" aria-label="' + esc(t('edit_item', { desc: description, amount: fm(e.amt) })) + '"><span class="category-mark" style="--category-color:' + c.c + '" aria-hidden="true">' + icon(['food', 'move', 'shop'].includes(c.k) ? c.k : c.k === 'bill' ? 'receipt' : 'tag') + '</span><span class="d"><span>' + esc(description) + '</span><small class="row-category">' + esc(cname(c)) + '</small></span><span class="a num">' + fa(e.amt) + '</span></button>';
}
function dayHTML(date, list) {
  return '<div class="card activity-card"><div class="day"><div class="day-heading">' + icon('receipt') + '<div><span class="day-title">' + t(date === today() ? 'activity_today' : 'activity_heading') + '</span><small>' + jstr(date) + '</small></div></div><small>' + t('activity_count', { n: nd(list.length) }) + '</small></div>' + (list.length ? '<div class="expense-list">' + list.map(rowHTML).join('') + '</div><div class="total"><span>' + t('day_total') + '</span><span class="num">' + hm(sum(list)) + '</span></div><p class="note">' + t('tap_hint') + '</p>' : '<div class="empty"><span class="empty-symbol">' + icon('receipt') + '</span><p>' + t('none_day') + '</p><small>' + t('empty_help') + '</small></div>');
}
function renderOverview(date) {
  const month = mkey(date), list = items.filter(e => mkey(e.date) === month);
  $('overview').innerHTML = '<div class="overview-title">' + icon('chart') + esc(t('overview_month', { month: mname(month) })) + '</div><span class="overview-amount num">' + fa(sum(list)) + (ul() ? '<small>' + esc(ul()) + '</small>' : '') + '</span><div class="overview-details"><span>' + t('overview_day') + '<b class="num">' + fa(sum(items.filter(e => e.date === date))) + '</b></span><span>' + t('overview_count') + '<b>' + nd(list.length) + '</b></span></div>';
}
function renderAdd() {
  const date = dpGet('dpAdd');
  renderOverview(date);
  $('bud1').innerHTML = budHTML(monthSum(mkey(date)), mname(mkey(date)));
  $('today').innerHTML = dayHTML(date, items.filter(e => e.date === date)) + '</div>';
  document.querySelectorAll('.un').forEach(el => { el.textContent = ul(); el.title = ul(); el.hidden = !ul(); });
}
function renderCal() {
  const y = cal.y, m = cal.m, key = y * 100 + m, offset = (new Date(toIso(y, m, 1) + 'T12:00:00').getDay() + (S.cal === 'g' ? 6 : 1)) % 7;
  const totals = new Map();
  items.filter(e => mkey(e.date) === key).forEach(e => totals.set(e.date, (totals.get(e.date) || 0) + Math.round(e.amt * 100)));
  const max = Math.max(0, ...totals.values()), total = [...totals.values()].reduce((a, b) => a + b, 0) / 100;
  let html = '<div class="calnav"><button id="cprev" aria-label="' + t('prev_month') + '">' + (rtl() ? '›' : '‹') + '</button><b>' + mname(key) + '</b><button id="cnext" aria-label="' + t('next_month') + '">' + (rtl() ? '‹' : '›') + '</button></div><div class="stat w" style="margin-bottom:10px"><small>' + t('cal_total') + '</small><b class="num">' + hm(total) + '</b></div><div class="grid">' + (S.cal === 'g' ? WG : WD)[S.lang].map(w => '<div class="wd">' + w + '</div>').join('');
  for (let i = 0; i < offset; i++) html += '<div class="cd e"></div>';
  for (let d = 1; d <= dim(y, m); d++) {
    const iso = toIso(y, m, d), cents = totals.get(iso) || 0;
    html += '<button class="cd' + (iso === cal.sel ? ' sel' : '') + (iso === today() ? ' tod' : '') + '" data-d="' + iso + '" aria-label="' + esc(jstr(iso) + ': ' + fm(cents / 100)) + '" aria-pressed="' + (iso === cal.sel) + '">' + (cents ? '<i aria-hidden="true" style="opacity:' + (.08 + .2 * cents / max).toFixed(2) + '"></i>' : '') + '<span class="n1">' + nd(d) + '</span><span class="n2 num">' + (cents ? cmp(cents / 100) : '') + '</span></button>';
  }
  $('cal').innerHTML = html + '</div><div class="note" style="margin:10px 0 0">' + t('cal_hint') + '</div>';
  const step = direction => { const focus = direction < 0 ? 'cprev' : 'cnext'; cal.m += direction; if (cal.m < 1) { cal.m = 12; cal.y--; } if (cal.m > 12) { cal.m = 1; cal.y++; } cal.sel = null; renderCal(); $(focus).focus(); };
  $('cprev').onclick = () => step(-1); $('cnext').onclick = () => step(1);
  $('calday').innerHTML = cal.sel && mkey(cal.sel) === key ? dayHTML(cal.sel, items.filter(e => e.date === cal.sel)) + '<div style="height:10px"></div><button class="btn alt" id="calnew">' + t('cal_add') + '</button></div>' : '';
  if ($('calnew')) $('calnew').onclick = () => { dpSet('dpAdd', cal.sel); tab(1); $('amt').focus(); };
}
$('cal').onclick = event => { const cell = event.target.closest('.cd[data-d]'); if (!cell) return; cal.sel = cell.dataset.d; renderCal(); $('cal').querySelector('[data-d="' + cal.sel + '"]').focus(); };
function fillEcat() {
  const selected = $('ecat').value;
  $('ecat').innerHTML = S.cats.map(c => '<option value="' + esc(c.k) + '">' + esc(cname(c)) + '</option>').join('');
  $('ecat').value = S.cats.some(c => c.k === selected) ? selected : 'other';
}
function openEdit(id) {
  const expense = items.find(e => e.id === id); if (!expense) return;
  returnFocus = document.activeElement; editId = id; editBase = { ...expense };
  $('eamt').value = expense.amt; $('edesc').value = expense.desc; $('ecat').value = expense.cat; dpSet('dpEdit', expense.date);
  $('eamt').setCustomValidity(''); $('md').hidden = false;
  $('appShell').inert = true;
  document.body.style.overflow = 'hidden'; $('eamt').focus();
}
function closeEdit() {
  $('md').hidden = true; editId = null; editBase = null;
  $('appShell').inert = false;
  document.body.style.overflow = '';
  if (returnFocus?.isConnected) returnFocus.focus(); else document.querySelector('.tabs .on').focus();
}
document.addEventListener('click', event => { const row = event.target.closest('.row'); if (row) openEdit(row.dataset.id); });
$('ecancel').onclick = closeEdit;
$('editClose').onclick = closeEdit;
$('md').onclick = event => { if (event.target === $('md')) closeEdit(); };
$('md').addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); closeEdit(); }
  if (event.key !== 'Tab') return;
  const focusables = [...$('md').querySelectorAll('button,input,select')].filter(el => !el.disabled);
  const first = focusables[0], last = focusables.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

function fillRange() {
  const previous = $('rng').value, months = new Set(items.map(e => mkey(e.date))); months.add(mkey(today()));
  const keys = [...months].sort((a, b) => b - a);
  $('rng').innerHTML = '<option value="all">' + t('all') + '</option><option value="c">' + t('custom') + '</option>' + keys.map(k => '<option value="' + k + '">' + mname(k) + '</option>').join('');
  $('rng').value = ['all', 'c', ...keys.map(String)].includes(previous) ? previous : String(mkey(today()));
}
function csvCell(value) {
  let text = String(value);
  // Quoting alone does not stop spreadsheets from executing formulas.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
const daysBetween = (from, to) => Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 864e5) + 1;
function report() {
  const value = $('rng').value, query = normaliseSearch($('q').value.trim());
  $('cust').hidden = value !== 'c';
  let from = dpGet('dpFrom'), to = dpGet('dpTo');
  if (value === 'c' && from > to) {
    $('rep').innerHTML = '<div class="empty">' + t('date_bad') + '</div>'; report.R = null; report.csv = ''; report.txt = ''; return;
  }
  const list = items.filter(e => value === 'all' || (value === 'c' ? e.date >= from && e.date <= to : mkey(e.date) === +value))
    .filter(e => !query || normaliseSearch(e.desc).includes(query) || normaliseSearch(cname(catOf(e.cat))).includes(query))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  report.csv = list.length ? 'Jalali,Gregorian,Category,Amount,Currency,Description\r\n' + list.map(e => [jlat(e.date), e.date, csvCell(cname(catOf(e.cat))), e.amt, csvCell(ul()), csvCell(e.desc)].join(',')).join('\r\n') : '';
  if (!list.length) { $('rep').innerHTML = '<div class="empty">' + t('empty') + '</div>'; report.txt = ''; report.R = null; return; }
  const groups = new Map(); list.forEach(e => { if (!groups.has(e.date)) groups.set(e.date, []); groups.get(e.date).push(e); });
  const order = [...groups.keys()], total = sum(list), isMonth = !['all', 'c'].includes(value);
  if (isMonth) { const y = Math.floor(+value / 100), m = +value % 100; from = toIso(y, m, 1); to = toIso(y, m, dim(y, m)); }
  if (value === 'all') { const dates = items.map(e => e.date).sort(); from = dates[0]; to = dates.at(-1); }
  const span = daysBetween(from, to), average = Math.round(total / span * 100) / 100;
  const top = order.reduce((best, d) => sum(groups.get(d)) > sum(groups.get(best)) ? d : best, order[0]);
  const label = value === 'all' ? t('all') + ': ' + jstr(from) + ' – ' + jstr(to) : value === 'c' ? jstr(from) + ' – ' + jstr(to) : mname(+value);
  let html = '<div class="stats"><div class="stat"><small>' + t('total') + '</small><b class="num">' + hm(total) + '</b></div><div class="stat"><small>' + t('avg') + '</small><b class="num">' + hm(average) + '</b></div><div class="stat w"><small>' + t('top') + '</small><b>' + jstr(top) + ' — <span class="num">' + hm(sum(groups.get(top))) + '</span></b></div></div><div class="note" style="margin:0 0 12px">' + t('avg_note', { n: nd(span) }) + '</div>';
  let text = t('report_t') + '\n' + label + '\n' + t('total') + ': ' + fm(total) + '\n' + t('avg') + ': ' + fm(average) + '\n' + t('avg_note', { n: nd(span) }) + '\n' + t('top') + ': ' + jstr(top) + ' (' + fm(sum(groups.get(top))) + ')\n';
  if (isMonth) {
    const key = +value, previousKey = key % 100 === 1 ? (Math.floor(key / 100) - 1) * 100 + 12 : key - 1, previousTotal = monthSum(previousKey);
    const difference = Math.round((monthSum(key) - previousTotal) * 100) / 100;
    const comparison = !previousTotal ? t('vs_none', { m: mname(previousKey) }) : t('vs', { m: mname(previousKey), p: pc(Math.abs(difference) / previousTotal * 100), w: t(difference > 0 ? 'more' : difference < 0 ? 'less' : 'same'), a: fm(Math.abs(difference)) });
    html += '<div class="stat" style="margin-bottom:12px"><small>' + t('vs_h') + '</small>' + esc(comparison) + '</div>' + budHTML(monthSum(key), mname(key)) + '<div class="note" style="margin:0 0 14px">' + t('month_scope') + '</div>';
    text += t('vs_h') + ': ' + comparison + '\n' + t('month_scope') + '\n';
  }
  const catTotals = new Map(); list.forEach(e => catTotals.set(e.cat, (catTotals.get(e.cat) || 0) + Math.round(e.amt * 100)));
  const cats = S.cats.filter(c => catTotals.has(c.k)).sort((a, b) => catTotals.get(b.k) - catTotals.get(a.k));
  html += '<h2>' + t('by_cat') + '</h2>' + cats.map(c => { const amount = catTotals.get(c.k) / 100, p = amount / total * 100; return '<div class="bar"><div class="t"><span>' + esc(cname(c)) + '</span><span class="num">' + hm(amount) + ' · ' + pc(p) + '</span></div><div class="b"><i style="width:' + p + '%;background:' + c.c + '"></i></div></div>'; }).join('');
  text += '\n' + t('cats_t') + ':\n' + cats.map(c => '• ' + cname(c) + ': ' + fm(catTotals.get(c.k) / 100)).join('\n') + '\n\n';
  order.forEach(date => { html += '<div class="day"><span>' + jstr(date) + '</span><small class="num">' + hm(sum(groups.get(date))) + '</small></div>' + groups.get(date).map(rowHTML).join(''); text += jstr(date) + '\n' + groups.get(date).map(e => '• ' + (e.desc || cname(catOf(e.cat))) + ' [' + cname(catOf(e.cat)) + ']: ' + fm(e.amt)).join('\n') + '\n' + t('day_total') + ': ' + fm(sum(groups.get(date))) + '\n\n'; });
  $('rep').innerHTML = html + '<div class="total"><span>' + t('total') + '</span><span class="num">' + hm(total) + '</span></div>';
  report.txt = text.trim(); report.R = { list, total, average, top, groups, cats, catTotals, label, span };
}
['rng', 'q'].forEach(id => { $(id).oninput = report; $(id).onchange = report; });
async function copyText(text, button) {
  if (!text) return;
  const label = button.querySelector('[data-i]') || button;
  const previousText = label.textContent, focused = document.activeElement;
  let copied = false;
  try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); copied = true; } } catch { /* Try an explicit selection fallback. */ }
  if (!copied) {
    const input = document.createElement('textarea'); input.value = text; input.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0'; document.body.append(input);
    try { input.focus(); input.select(); input.setSelectionRange(0, text.length); copied = document.execCommand('copy') === true; } catch { copied = false; }
    finally { input.remove(); if (focused?.isConnected) focused.focus(); }
  }
  if (copied) { label.textContent = t('copied'); setTimeout(() => { label.textContent = label.dataset.i ? t(label.dataset.i) : previousText; }, 1500); }
  else notify('copy_failed', true);
  return copied;
}
function deliver(name, data, type = 'application/json;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([data], { type })), anchor = document.createElement('a');
  try { anchor.href = url; anchor.download = name; document.body.append(anchor); anchor.click(); }
  finally { anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000); }
}
export function preparePrint() {
  const R = report.R; if (!R) return null;
  let view = $('printView'); if (!view) { view = document.createElement('section'); view.id = 'printView'; document.body.append(view); }
  view.className = 'print-preview';
  view.innerHTML = '<div class="print-actions"><p>' + t('print_hint') + '</p><button id="printNow" class="btn">' + t('print_now') + '</button><button id="printClose" class="btn alt">' + t('print_back') + '</button><p id="printMessage" role="status" aria-live="polite"></p></div><h1>' + t('report_t') + '</h1><p>' + esc(R.label) + '</p><p>' + t('total') + ': <b>' + hm(R.total) + '</b> · ' + t('avg') + ': ' + hm(R.average) + '</p><p>' + t('avg_note', { n: nd(R.span) }) + '</p><p>' + t('top') + ': ' + jstr(R.top) + ' — ' + hm(sum(R.groups.get(R.top))) + '</p><h2>' + t('by_cat') + '</h2><table><thead><tr><th>' + t('cat') + '</th><th class="amount">' + t('amount') + '</th></tr></thead><tbody>' + R.cats.map(c => '<tr><td>' + esc(cname(c)) + '</td><td class="amount">' + hm(R.catTotals.get(c.k) / 100) + '</td></tr>').join('') + '</tbody></table><h2>' + t('report_t') + '</h2><table><thead><tr><th style="width:22%">' + t('date') + '</th><th>' + t('desc') + ' / ' + t('cat') + '</th><th class="amount">' + t('amount') + '</th></tr></thead><tbody>' + R.list.map(e => '<tr' + (e.desc.length > 1600 ? ' style="break-inside:auto;page-break-inside:auto"' : '') + '><td>' + jstr(e.date) + '</td><td>' + esc(e.desc || cname(catOf(e.cat))) + '<br><small>' + esc(cname(catOf(e.cat))) + '</small></td><td class="amount">' + hm(e.amt) + '</td></tr>').join('') + '</tbody></table>';
  view.hidden = false; document.body.classList.add('preview-open');
  $('printClose').onclick = () => { view.hidden = true; document.body.classList.remove('preview-open'); $('pdf').focus(); };
  $('printNow').onclick = async () => {
    const button = $('printNow'); if (button.disabled) return; button.disabled = true;
    try { await document.fonts?.ready; if (typeof window.print !== 'function') throw new Error('print-unavailable'); window.print(); }
    catch { $('printMessage').textContent = t('export_failed'); }
    finally { button.disabled = false; }
  };
  $('printNow').focus(); return view;
}
function catMgr() {
  $('catlist').innerHTML = S.cats.map(c => '<div class="crow"><input type="color" value="' + c.c + '" data-k="' + esc(c.k) + '" aria-label="' + esc(t('cat_color', { name: cname(c) })) + '"><span>' + esc(cname(c)) + '</span>' + (c.k === 'other' ? '' : '<button type="button" class="xb" data-k="' + esc(c.k) + '" aria-label="' + esc(t('del') + ': ' + cname(c)) + '">' + icon('trash') + '</button>') + '</div>').join('');
}
function applyTheme() {
  const theme = activeTheme(S.theme, systemScheme.matches);
  document.documentElement.dataset.theme = theme.key;
  document.querySelector('meta[name="theme-color"]').content = theme.bg;
}
systemScheme.addEventListener?.('change', () => { if (S.theme === 'auto') applyTheme(); });
function renderThemes() {
  $('themes').innerHTML = THEMES.map(theme => {
    const selected = themeKey(S.theme) === theme.key;
    return '<button type="button" class="th' + (selected ? ' on' : '') + '" data-k="' + theme.key + '" aria-pressed="' + selected + '">' + '<span class="theme-system-icon">' + icon('sun') + '</span><span class="theme-preview" style="--preview-bg:' + theme.bg + ';--preview-surface:' + theme.surface + ';--preview-ink:' + theme.ink + ';--preview-accent:' + theme.accent + '" aria-hidden="true"><span class="preview-sidebar"><i></i><i></i><i></i></span><span class="preview-main"><i></i><i></i><i></i></span></span><span class="theme-info"><b>' + t(theme.name) + '</b><small>' + t(theme.description) + '</small></span>' + (selected ? '<span class="theme-check">' + icon('check') + '</span>' : '') + '</button>';
  }).join('');
}
function ucShow() { $('ucustom').style.display = S.unit === 'custom' ? 'block' : 'none'; $('ucustomLabel').hidden = S.unit !== 'custom'; $('ucustom').value = S.ucustom; }
function applyLang() {
  document.documentElement.lang = S.lang; document.documentElement.dir = rtl() ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i]').forEach(el => { el.textContent = t(el.dataset.i); });
  document.querySelectorAll('[data-p]').forEach(el => { el.placeholder = t(el.dataset.p); });
  $('unit').innerHTML = ['none', 'toman', 'rial', 'custom'].map(k => '<option value="' + k + '">' + t('u_' + k) + '</option>').join(''); $('unit').value = S.unit; ucShow();
  $('calsel').innerHTML = ['j', 'g'].map(k => '<option value="' + k + '">' + t('cal_' + k) + '</option>').join(''); $('calsel').value = S.cal;
  $('lang').value = S.lang; $('bud').value = S.budget || '';
  $('cname').setAttribute('aria-label', t('cat_name')); $('ccol').setAttribute('aria-label', t('cat_color', { name: t('cat') }));
  $('offlinemsg').textContent = t(offlineKey);
  $('connectionState').textContent = t(offlineKey);
  $('connectionState').parentElement.classList.toggle('ready', offlineKey === 'offline_ready');
  $('navigation').setAttribute('aria-label', rtl() ? 'بخش‌های برنامه' : 'App sections');
  $('editClose').setAttribute('aria-label', t('close_edit'));
  $('headerDate').textContent = jstr(today());
  $('goCalendar').setAttribute('aria-label', t('open_calendar') + ': ' + jstr(today()));
  updatePageHeading();
  renderThemes(); renderChips(); fillEcat(); catMgr();
}
function refresh() { if (cur === 1) renderAdd(); else if (cur === 2) renderCal(); else if (cur === 3) { fillRange(); report(); } }
function updatePageHeading() {
  $('pageTitle').textContent = t('view_' + viewNames[cur - 1]);
  $('pageSubtitle').textContent = t('subtitle_' + viewNames[cur - 1]);
  document.title = 'DANG — ' + t('view_' + viewNames[cur - 1]);
}
function tab(n, writeUrl = true) {
  const changed = cur !== n;
  cur = n;
  for (let i = 1; i <= 4; i++) { $('v' + i).hidden = i !== n; $('t' + i).className = i === n ? 'on' : ''; $('t' + i).setAttribute('aria-pressed', String(i === n)); }
  if (n === 4) { $('bud').value = S.budget || ''; if (!backupDraft) bkFill(); $('bkmsg').textContent = ''; }
  updatePageHeading();
  if (writeUrl && changed) { const url = new URL(location.href); url.searchParams.set('view', viewNames[n - 1]); history.pushState(null, '', url); }
  refresh();
}
function adopt(state, reset = false) {
  if ((state.rev ?? 0) < appliedRevision) return;
  const dates = Object.fromEntries(pickerIds.map(id => [id, dpGet(id)]));
  const focused = document.activeElement;
  const focusedPicker = focused.closest?.('.dp');
  const pickerClass = focusedPicker ? focused.className : null;
  const anchor = toIso(cal.y, cal.m, 1), changedCalendar = S.cal !== state.settings.cal;
  items = state.items; S = state.settings; appliedRevision = state.rev ?? 0;
  applyTheme(); applyLang();
  pickerIds.forEach(id => { dpInit(id, $(id)._cb); dpSet(id, dates[id]); });
  if (changedCalendar) { const j = D(cal.sel || anchor); cal.y = j.y; cal.m = j.m; }
  if (reset) dpReset();
  refresh();
  if (focusedPicker) $(focusedPicker.id).querySelector('.' + pickerClass)?.focus();
}
async function commit(operation, reset = false) {
  try {
    const available = await ready;
    if (!available) throw new Error('storage-unavailable');
    const result = await store.change(operation);
    adopt(result.state, reset); channel?.postMessage('changed'); notify('saved'); return result;
  } catch (error) {
    notify(error.message === 'conflict' ? 'conflict' : 'storage_error', true);
    if (error.message === 'conflict') await sync();
    return null;
  }
}
async function sync() {
  if (!store.db || !await ready) return;
  try { const state = await store.read(); if (state) adopt(state); }
  catch { notify('storage_error', true); }
}
function asyncButton(id, action) {
  $(id).onclick = async event => { event?.preventDefault(); const button = $(id); if (button.disabled) return; button.disabled = true; button.setAttribute('aria-busy', 'true'); try { await action(); } catch { notify('export_failed', true); } finally { button.disabled = false; button.removeAttribute('aria-busy'); } };
}
async function addCat(name, color) {
  if (!name || name.length > 120) return;
  const key = uid(), result = await commit(state => { state.settings.cats.splice(state.settings.cats.length - 1, 0, { k: key, n: name, c: color || '#956b35' }); });
  if (result) { curCat = key; renderChips(); }
  return !!result;
}
$('chips').onclick = async event => { const button = event.target.closest('.chip'); if (!button) return; if (button.dataset.k === '+') { const name = prompt(t('newcat_p')); if (name?.trim()) await addCat(name.trim()); } else { curCat = button.dataset.k; renderChips(); } };
asyncButton('add', async () => {
  const amount = parseAmount($('amt').value); if (amount === null) { inputError('amt', 'amount_bad'); return; }
  const expense = { id: uid(), date: dpGet('dpAdd'), amt: amount, desc: $('desc').value.trim(), cat: curCat };
  if (await commit(state => { expense.cat = state.settings.cats.some(c => c.k === expense.cat) ? expense.cat : 'other'; state.items.push(expense); })) { $('amt').value = ''; $('desc').value = ''; if (matchMedia('(pointer: coarse)').matches) document.activeElement?.blur(); else $('amt').focus(); }
});
$('expenseForm').onsubmit = event => { event.preventDefault(); $('add').click(); };
asyncButton('esave', async () => {
  const amount = parseAmount($('eamt').value); if (amount === null) { inputError('eamt', 'amount_bad'); return; }
  const id = editId, base = editBase, updated = { id, amt: amount, desc: $('edesc').value.trim(), cat: $('ecat').value, date: dpGet('dpEdit') };
  if (await commit(state => { const index = state.items.findIndex(e => e.id === id); if (index < 0 || !sameExpense(state.items[index], base)) throw new Error('conflict'); state.items[index] = updated; })) closeEdit();
});
asyncButton('edel', async () => {
  if (!confirm(t('del_q'))) return;
  const id = editId, base = editBase;
  if (await commit(state => { const expense = state.items.find(e => e.id === id); if (!expense || !sameExpense(expense, base)) throw new Error('conflict'); state.items = state.items.filter(e => e.id !== id); })) closeEdit();
});
asyncButton('cadd', async () => { if (await addCat($('cname').value.trim(), $('ccol').value)) $('cname').value = ''; });
$('catlist').onchange = async event => { const input = event.target; if (input.type !== 'color') return; if (!await commit(state => { const category = state.settings.cats.find(c => c.k === input.dataset.k); if (category) category.c = input.value; })) catMgr(); };
$('catlist').onclick = async event => { const button = event.target.closest('.xb'); if (!button || !confirm(t('cat_del_q'))) return; const key = button.dataset.k; await commit(state => { state.settings.cats = state.settings.cats.filter(c => c.k !== key || c.k === 'other'); state.items.forEach(e => { if (e.cat === key) e.cat = 'other'; }); }); };
$('themes').onclick = async event => { const button = event.target.closest('.th'); if (button) await commit(state => { state.settings.theme = button.dataset.k; }); };
for (const [id, key] of [['unit', 'unit'], ['ucustom', 'ucustom'], ['calsel', 'cal'], ['lang', 'lang']]) {
  $(id).onchange = async () => { const value = $(id).value.trim(); if (!await commit(state => { state.settings[key] = value; })) { $(id).value = S[key]; } };
}
$('bud').onchange = async () => {
  const amount = $('bud').value.trim() === '' ? 0 : parseAmount($('bud').value, true);
  if (amount === null) { inputError('bud', 'budget_bad'); return; }
  await commit(state => { state.settings.budget = amount; });
};
function bkFill() { $('bk').value = JSON.stringify({ v: 3, items, settings: S }, null, 2); backupDraft = false; }
$('bk').addEventListener('input', () => { backupDraft = true; });
asyncButton('bkcopy', async () => { await sync(); bkFill(); await copyText($('bk').value, $('bkcopy')); });
asyncButton('bkfile', async () => { await sync(); bkFill(); deliver('dang-backup-' + today() + '.json', $('bk').value); });
$('bkinput').onchange = async () => {
  const file = $('bkinput').files[0]; if (!file) return;
  try { if (file.size > 20e6) throw new Error('file-too-large'); const text = await file.text(); validateBackup(JSON.parse(text)); $('bk').value = text; backupDraft = true; $('bkmsg').textContent = t('bk_loaded'); }
  catch { $('bkmsg').textContent = t('bk_bad'); } finally { $('bkinput').value = ''; }
};
asyncButton('bkrest', async () => {
  let backup;
  try { backup = validateBackup(JSON.parse($('bk').value)); } catch { $('bkmsg').textContent = t('bk_bad'); return; }
  const restoreSettings = $('restoreSettings').checked;
  const result = await commit(state => {
    if (!restoreSettings && backup.settings) {
      const existing = new Set(state.settings.cats.map(c => c.k));
      for (const category of backup.settings.cats) if (!existing.has(category.k)) state.settings.cats.push(category);
      backup = { ...backup, settings: null };
    }
    return mergeBackup(state, backup);
  });
  if (result) $('bkmsg').textContent = t('bk_ok', { n: nd(result.value) });
});
asyncButton('recovery', async () => { if (recoveryData) deliver('dang-original-data.json', JSON.stringify(recoveryData, null, 2)); });
asyncButton('persist', async () => {
  try { $('persistmsg').textContent = !navigator.storage?.persist ? t('persist_na') : t(await navigator.storage.persist() ? 'persist_yes' : 'persist_no'); }
  catch { $('persistmsg').textContent = t('persist_no'); }
});
async function wipe(delItems, delSettings, keepLanguage = false) {
  const result = await commit(state => {
    if (delItems) state.items = [];
    if (delSettings) {
      const language = state.settings.lang, used = new Set(state.items.map(e => e.cat)), previousCats = state.settings.cats;
      state.settings = defaultSettings(); if (keepLanguage) state.settings.lang = language;
      // Resetting appearance must not erase category names attached to kept expenses.
      for (const c of previousCats) if (used.has(c.k) && !state.settings.cats.some(x => x.k === c.k)) state.settings.cats.push(c);
    }
  }, true);
  if (result) { curCat = 'food'; renderChips(); tab(4); $('wmsg').textContent = t('w_done'); }
}
$('wReload').onclick = () => location.reload();
asyncButton('wSet', async () => { if (confirm(t('w_q3'))) await wipe(false, true, true); });
asyncButton('wItems', async () => { if (confirm(t('w_q1')) && confirm(t('w_q2'))) await wipe(true, false); });
asyncButton('wAll', async () => { if (confirm(t('w_q4')) && confirm(t('w_q2'))) await wipe(true, true); });
asyncButton('copy', async () => { await copyText(report.txt, $('copy')); });
asyncButton('csv', async () => { if (report.csv) deliver('expenses.csv', '\uFEFF' + report.csv, 'text/csv;charset=utf-8'); });
asyncButton('pdf', async () => { if (preparePrint()) await $('printNow').onclick(); });
for (let i = 1; i <= 4; i++) { $('t' + i).onclick = () => tab(i); $('t' + i).setAttribute('aria-controls', 'v' + i); }
$('goCalendar').onclick = () => { tab(2); $('cprev').focus(); };
window.addEventListener('popstate', () => { const n = viewNames.indexOf(new URL(location.href).searchParams.get('view')) + 1; tab(n || 1, false); });

function readLegacy() {
  let itemsText = null, settingsText = null, oldItems = [], settings = {}, warning = false;
  try { itemsText = localStorage.getItem('expenses-v1'); settingsText = localStorage.getItem('expenses-settings-v1'); }
  catch { warning = true; }
  try { oldItems = JSON.parse(itemsText || '[]'); settings = JSON.parse(settingsText || '{}'); validateBackup({ items: oldItems, settings }); }
  catch { warning = true; try { oldItems = JSON.parse(itemsText || '[]'); } catch { oldItems = []; } try { settings = JSON.parse(settingsText || '{}'); } catch { settings = {}; } }
  return { items: oldItems, settings, warning, raw: itemsText || settingsText ? { itemsText, settingsText } : null };
}
dpReset(); applyTheme(); applyLang(); tab(viewNames.indexOf(new URL(location.href).searchParams.get('view')) + 1 || 1, false); notify('loading');
document.body.setAttribute('aria-busy', 'true');
export const ready = (async () => {
  const legacy = readLegacy();
  try {
    const result = await store.open(legacy); adopt(result.state); if (cur === 4 && !backupDraft) bkFill();
    recoveryData = await store.read('recovery'); $('recovery').hidden = !recoveryData;
    if (typeof BroadcastChannel === 'function') { channel = new BroadcastChannel(store.name); channel.onmessage = () => sync(); }
    notify(result.repaired || (result.created && legacy.warning) ? 'legacy_warning' : result.created && legacy.raw ? 'migrated' : '');
    return true;
  } catch {
    // Allow exporting recovered legacy data even when persistent storage is blocked.
    const settings = normaliseSettings(legacy.settings);
    try { adopt({ settings, items: normaliseItems(legacy.items, settings.cats), rev: 0 }); } catch { /* Raw data is retained below. */ }
    recoveryData = legacy.raw; $('recovery').hidden = !recoveryData;
    notify('storage_error', true); return false;
  } finally { document.body.removeAttribute('aria-busy'); }
})();
window.addEventListener('focus', () => sync());
document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });
window.addEventListener('pagehide', () => channel?.close());
window.addEventListener('pageshow', event => { if (event.persisted && channel) { channel = new BroadcastChannel(store.name); channel.onmessage = () => sync(); sync(); } });
window.addEventListener('beforeprint', () => {
  if ($('printView') && !$('printView').hidden) return;
  fillRange(); $('rng').value = 'all'; report();
  if (report.R) preparePrint();
  else {
    let view = $('printView');
    if (!view) { view = document.createElement('section'); view.id = 'printView'; document.body.append(view); }
    view.className = 'print-preview'; view.hidden = false;
    view.innerHTML = '<div class="print-actions"><button id="printEmptyClose" class="btn alt">' + t('print_back') + '</button></div><h1>' + t('report_t') + '</h1><p>' + t('empty') + '</p>';
    document.body.classList.add('preview-open');
    $('printEmptyClose').onclick = () => { view.hidden = true; document.body.classList.remove('preview-open'); document.querySelector('.tabs .on').focus(); };
  }
});
async function offlineSetup() {
  try {
    if (!('serviceWorker' in navigator)) throw new Error('unsupported');
    const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
    await navigator.serviceWorker.ready;
    offlineKey = 'offline_ready'; $('offlinemsg').textContent = t(offlineKey); $('connectionState').textContent = t(offlineKey); $('connectionState').parentElement.classList.add('ready');
    // A waiting update can activate safely: current pages keep their loaded code.
    registration.waiting?.postMessage({ type: 'ACTIVATE' });
  } catch { offlineKey = 'offline_na'; $('offlinemsg').textContent = t(offlineKey); $('connectionState').textContent = t(offlineKey); }
}
offlineSetup();
if (window.visualViewport) {
  let viewportHeight = window.innerHeight;
  const updateKeyboard = () => {
    const inputFocused = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '');
    if (!inputFocused) viewportHeight = window.innerHeight;
    const keyboard = inputFocused && visualViewport.scale === 1 && viewportHeight - visualViewport.height > 150;
    document.body.classList.toggle('keyboard-open', keyboard);
  };
  visualViewport.addEventListener('resize', updateKeyboard);
  document.addEventListener('focusin', updateKeyboard);
  document.addEventListener('focusout', updateKeyboard);
}
