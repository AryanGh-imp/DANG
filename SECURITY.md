# Security Policy

## Supported versions

Security fixes target the current `main` branch. Historical local-storage data and supported backup versions are migration inputs, not separately maintained application releases.

## Reporting a vulnerability

For a vulnerability that could expose financial data, inject script, corrupt storage, or compromise release workflows, avoid posting sensitive details or real backups in a public issue.

If GitHub's private vulnerability reporting is enabled for [AryanGh-imp/DANG](https://github.com/AryanGh-imp/DANG), use the repository's Security tab to report it privately. Otherwise contact [AryanGh-imp](https://github.com/AryanGh-imp) to arrange a private reporting channel before sharing sensitive details. No response-time guarantee or bug-bounty program is currently defined.

Include the affected commit, browser/OS, reproducible steps, expected behavior, and a minimal synthetic example. Do not include credentials, personal financial records, or browser-profile archives.

## Security boundaries

DANG runs on a static host and stores data locally. It escapes user-provided report content, validates backup fields and category colors, uses atomic writes, neutralizes spreadsheet formulas in CSV, and scopes worker caches to its own application path.

Local storage is not application-encrypted. A compromised device/browser profile or malicious code executing on the hosting origin is outside that local confidentiality boundary. Export backups regularly and keep the hosting repository and workflow permissions protected.

See [privacy](docs/privacy.md) for data handling and [architecture](docs/architecture.md) for transaction and cache behavior.

Version 1.0.1 permits the official Cloudflare analytics script and collector as an optional runtime dependency. Its public site token is intentionally visible. Expense data is not provided to analytics; tests inspect current beacon payloads for synthetic financial markers. Changes to analytics must retain this boundary and offline independence. The optional local display hint contains only validated presentation preferences; it does not replace IndexedDB or hold financial records.
