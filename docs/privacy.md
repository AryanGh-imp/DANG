# Privacy and Browser Storage

DANG has no account system, backend expense database or automatic synchronization. Expenses, settings and recovery records stay in IndexedDB on the current browser and application origin/path. Version 1.0.1 adds optional Cloudflare Web Analytics for visits and performance.

## Network boundary

While online, the browser requests application files from the static hosting provider. On GitHub Pages, ordinary hosting requests are handled by GitHub and are subject to GitHub's policies. DANG does not send expense records, descriptions, budgets, categories, or backups in these requests.

The maintainer credit is a normal external link. Opening it visits GitHub; it does not attach expense data. The link uses `noopener noreferrer` when opening a new tab. README reference links and repository workflows are separate from application runtime behavior.

## Cloudflare Web Analytics

The online page loads `https://static.cloudflareinsights.com/beacon.min.js` and the official beacon sends telemetry to `https://cloudflareinsights.com/cdn-cgi/rum`. The site token in HTML is an intended public analytics identifier, not a private API credential.

The current beacon measures visits, browser/device details, navigation timing and Web Vitals. It may include structural element selectors and geometry for performance attribution. It removes query strings/fragments from transmitted page/referrer URLs. DANG's internal `?view=` changes generate navigation telemetry but are aggregated under the same application path; the default snippet does not expose a separate section name in the dashboard.

DANG does not pass expense records, amounts, descriptions, category names, budgets, currency labels or backup contents to analytics. Dedicated tests exercise these fields with recognizable synthetic values and inspect the current official beacon's payloads. The provider script runs in the page context and is delivered by Cloudflare; the integration relies on that provider and should be retested when its behavior changes. See [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) for the provider's privacy description.

Analytics does not initialize the application, read its store through an application API, or participate in service-worker precaching. Blocking it or losing connectivity does not prevent local saving, reports, recovery or offline use. A browser may show a failed-resource diagnostic for an unavailable optional script; there are no required analytics calls in the application initialization path.

## Storage lifetime

IndexedDB is durable browser storage, not a guaranteed permanent backup. Data can disappear when site data is cleared, a private-browsing session ends, a browser profile is removed, or the browser evicts storage. Settings includes a request for persistent storage; approval depends on the browser.

The service-worker cache contains application files, not the expense database. Updating or replacing that cache does not delete expenses. Clearing all site data can remove both. Different browsers, devices, hosts, and application paths have separate storage contexts.

The path-scoped `dang-display:<path>` localStorage entry contains only language, calendar, theme and a boolean indicating whether a budget is configured. It helps avoid a first-render language/theme flash. It contains no expenses, amounts, descriptions, category definitions or backups; IndexedDB settings remain authoritative. Failure to write this hint does not fail a saved expense transaction.

Local data is not encrypted by DANG and there is no application password. Someone with access to the same browser profile can access the ledger. Device and browser-profile protections determine local access.

## Backups and exports

JSON backups include all exported expenses and settings. CSV and print reports include the selected report data. These files and clipboard contents can contain personal financial information; store and share them according to your own needs. None are uploaded automatically.

The repository's example backup and screenshots contain synthetic data. The release build excludes examples, tests, screenshots, and development output. Do not add personal exported backups to the repository.

For the data structure, see [backup format](data-format.md). For security reporting, see [SECURITY.md](../SECURITY.md).
