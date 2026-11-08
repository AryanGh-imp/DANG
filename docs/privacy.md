# Privacy and Browser Storage

DANG has no account system, backend database, automatic synchronization, analytics, or runtime third-party CDN. Expenses, settings, and recovery records stay in IndexedDB on the current browser and application origin/path.

## Network boundary

While online, the browser requests application files from the static hosting provider. On GitHub Pages, ordinary hosting requests are handled by GitHub and are subject to GitHub's policies. DANG does not send expense records, descriptions, budgets, categories, or backups in these requests.

The maintainer credit is a normal external link. Opening it visits GitHub; it does not attach expense data. The link uses `noopener noreferrer` when opening a new tab. README reference links and repository workflows are separate from application runtime behavior.

## Storage lifetime

IndexedDB is durable browser storage, not a guaranteed permanent backup. Data can disappear when site data is cleared, a private-browsing session ends, a browser profile is removed, or the browser evicts storage. Settings includes a request for persistent storage; approval depends on the browser.

The service-worker cache contains application files, not the expense database. Updating or replacing that cache does not delete expenses. Clearing all site data can remove both. Different browsers, devices, hosts, and application paths have separate storage contexts.

Local data is not encrypted by DANG and there is no application password. Someone with access to the same browser profile can access the ledger. Device and browser-profile protections determine local access.

## Backups and exports

JSON backups include all exported expenses and settings. CSV and print reports include the selected report data. These files and clipboard contents can contain personal financial information; store and share them according to your own needs. None are uploaded automatically.

The repository's example backup and screenshots contain synthetic data. The release build excludes examples, tests, screenshots, and development output. Do not add personal exported backups to the repository.

For the data structure, see [backup format](data-format.md). For security reporting, see [SECURITY.md](../SECURITY.md).
