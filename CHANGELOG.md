# Changelog

Release versions describe application changes; database format and service-worker cache versions are maintained separately.

## 1.0.0 — 2026-11-08

Initial project release.

### Interface and identity

- Introduced a responsive Achaemenid-inspired ledger with desktop sidebar and mobile bottom navigation.
- Added six coordinated themes, system appearance support, self-hosted Vazirmatn and consistent control icons.
- Replaced the previous brand icon with derivatives of the maintainer-supplied warrior engraving.
- Added visible GitHub maintainer credit and Pages sharing metadata.
- Improved forms, errors, dialogs, keyboard focus, RTL/LTR, touch spacing and long-content layouts.
- Added first-visit browser language detection with an English fallback and a global English / فارسی header switch that preserves saved preferences and expense drafts.
- Added separate English/Gregorian and Persian/Jalali preview sets with real phone viewport captures and bottom-positioned navigation.

### Data and offline behavior

- Consolidated storage writes into validated IndexedDB transactions with migration recovery and edit-conflict detection.
- Preserved failed-write drafts, validated backup merges and stable repeated imports.
- Corrected report ranges and averages, escaped printing content and neutralized CSV formulas.
- Added path-scoped, versioned offline caching of application modules, fonts and icons.
- Added background release detection, a one-button update notice, complete-download activation and draft protection across tabs.

### Repository and release preparation

- Added English technical documentation and a separate Persian README.
- Added MIT source/documentation licensing, font and artwork notices, contribution guidance and security reporting instructions.
- Added a validated static release allowlist and production-artifact browser checks.
- Added deterministic cache fingerprints from published content so future feature deployments invalidate cached releases automatically.
- Added reusable CI with Chromium/WebKit checks and a gated GitHub Pages workflow.
- Aligned development and CI with Node.js 26 LTS using `.nvmrc` as the shared version selector.
- Organized the initial source history into meaningful module and documentation commits.

This entry records local release preparation. Publication occurs only after a reviewed push and successful Pages workflow run.
