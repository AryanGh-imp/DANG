# Architecture

DANG is a static application built with HTML, CSS, and browser-native JavaScript modules. Production requires HTTPS static hosting, IndexedDB, and a service-worker-capable browser. Node.js and npm are development tools only.

## Module responsibilities

| File | Responsibility |
| --- | --- |
| `index.html` | Semantic application shell, navigation, forms, metadata, install links |
| `app.js` | View state, date adapters, rendering, user actions, reports, exports, focus and synchronization |
| `store.js` | Validation, normalizing legacy data, backup merges, IndexedDB transactions |
| `i18n.js` | Persian/English labels, calendar month names and weekday labels |
| `locale.js` | First-visit language and calendar preferences from supported browser languages |
| `updates.js` | Background release checks, waiting-worker activation and consented reloads |
| `themes.js` | Theme definitions, system appearance selection, legacy aliases |
| `icons.js` | Inline SVG symbols for UI controls |
| `assets/css/styles.css` | Theme tokens, responsive layout, accessibility and printing |
| `sw.js` | Versioned, application-path-scoped static asset cache |
| `manifest.webmanifest` | Standalone installation identity, scope, launch URL, icons |

```mermaid
flowchart LR
  UI[HTML and CSS interface] --> App[app.js controller]
  App --> Dates[i18n.js labels and app date adapters]
  App --> Theme[themes.js and icons.js]
  App --> Store[store.js validation and transactions]
  Store --> DB[(IndexedDB)]
  App --> Export[Local JSON, CSV and print exports]
  Worker[Service worker] --> Cache[(Versioned static cache)]
  Cache --> UI
```

## Storage lifecycle

The database name is `dang-expenses-v3:` followed by the application directory path. The database has version 1 and an object store named `data`. Its `state` record contains `{ v, rev, settings, items }`; the optional `recovery` record retains original migration or repair data. The record format version, database version, package version, and service-worker cache version serve different purposes.

The application's first release is 1.0.0. The existing `v3` database namespace and backup format are compatibility identifiers retained to keep previously stored expenses available; they are not previous public application releases.

Every write reads the latest record inside an IndexedDB `readwrite` transaction, applies a synchronous operation, validates the result, increments the revision, and writes it back. IndexedDB serializes these transactions across tabs. Failed validation or writes abort the transaction; the UI does not report a successful save or clear its input on failure.

The application captures the expense being edited and compares it with the current stored expense before applying an edit. A conflicting edit reports a conflict rather than silently replacing the other tab's change. BroadcastChannel notifications, and synchronization when views become active, update local UI state. Transaction correctness does not rely on BroadcastChannel availability.

## Migration and recovery

At startup, the app reads the historical `expenses-v1` and `expenses-settings-v1` localStorage keys. The initial database record normalizes valid data and retains originals for recovery. Existing migrated records are not imported again on every launch. Invalid stored records can be repaired at startup while preserving the original record in recovery storage.

The browser's storage is scoped by origin as well as path. Changing from localhost to Pages, changing hostname, or changing application path creates a separate storage context. A JSON backup is the supported transfer mechanism.

## Language preferences

On first visit, `locale.js` selects the first Persian or English entry in `navigator.languages` (using `navigator.language` when the list is unavailable). Unsupported language lists fall back to English. A new Persian profile starts with Jalali; a new English profile starts with Gregorian.

These preferences only seed database creation. Saved IndexedDB settings and valid legacy language/calendar choices take precedence. Legacy profiles without a calendar choice retain the original Jalali default. The global header control and Settings selector update the same language setting through the existing transaction flow. Switching preserves the current view, selected calendar, expense dates and expense draft; a failed write keeps the current language.

## Views and navigation

The four views are entry, calendar, report, and settings. The `view` query parameter records the selected view (`add`, `calendar`, `report`, or `settings`). The History API supports back/forward navigation without separate routed HTML pages. Expense dates are stored as Gregorian ISO date strings; display adapters provide Jalali or Gregorian presentation.

Reports use integer cents for summation. Daily averages use all calendar days in the selected range, not only days with expenses. Monthly comparison and budget calculations use the whole month, independently of filtered report rows.

## Offline behavior

The worker derives its scope from its own URL and prefixes cache names with the application path. Installation precaches every listed asset with `cache: 'reload'`, bypassing stale HTTP-cache copies. Fetch handling serves the installed version as a unit and ignores other projects' paths and external requests. A failed precache cannot replace the working version.

An initial worker activates normally. Later workers wait until a user selects Update app. `updates.js` registers with `updateViaCache: 'none'` and checks at startup, online events, focus/visibility changes and five-minute intervals while visible; focus checks are throttled to once per minute. The update banner remains available in every view without moving focus.

Activation removes previous caches belonging to the same app path and claims clients. The requesting tab reloads once after its controller changes and activation completes. Other tabs retain loaded code and receive their own update notice. The app checks for pending writes, expense/backup/category/settings input and an open editor both before activation and before reloading. Unfinished work postpones the reload. A fully cached update can also be applied offline.

Expense data lives separately in IndexedDB. `scripts/release-version.js` fingerprints the allowlisted source bytes and application version. The Pages build stamps this deterministic identity into the copied `dist/sw.js`, leaving source files untouched. Published runtime changes receive a new cache identity automatically; documentation-only changes keep it. Direct source-server development still uses the editable `VERSION` in `sw.js`. See [deployment](deployment.md).

## Export boundary

JSON, CSV, and print reports are generated locally. Exported descriptions and custom currency labels are escaped before HTML rendering. CSV values resembling spreadsheet formulas are neutralized. PDF output uses native browser printing; it is not a separate PDF service or automatic cloud upload.
