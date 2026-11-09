# Changelog

Release versions describe application changes; database format and service-worker cache versions are maintained separately.

## 1.0.1 — 2026-11-09

### Quality and performance

- Establish language/direction and theme before body rendering, with a path-scoped display-preference mirror and an early read for existing profiles.
- Populate translated initial shell labels, reserve date/category/content space, preload both local font subsets, and keep the startup notice out of normal layout flow.
- Generate responsive 180/360/540-pixel hero images and small WebP brand portraits; optimize PNG installation icons with high-fidelity palettes while preserving the original emblem.
- Translate expense-summary and emblem descriptions in both languages, match the GitHub credit's accessible name to its visible text, and include WCAG 2.1 Level A rules in automated checks.

### Analytics, compatibility and documentation

- Integrate the official Cloudflare Web Analytics module with the maintainer's public site token. Analytics is independent of initialization and offline caching; financial data is excluded from the exercised telemetry payloads.
- Use string URLs for History API navigation, including compatibility with analytics history wrappers.
- Add cold-start, saved-preference, accessibility, analytics/privacy and actual v1.0.0-to-v1.0.1 upgrade regressions; extend WebKit coverage to functional and deployment behavior.
- Keep module loading free of `modulepreload` after a WebKit regression showed that a second tab could reuse the previous release's module after an offline update.
- Isolate ordinary functional tests from the real analytics dashboard; integration tests use the current official script and a real temporary collector.
- Update both READMEs and the architecture, privacy, design, testing, deployment, security and contribution guidance. Keep database version 1, stored format 3 and backup format 3 unchanged.

## 1.0.0 — 2026-11-09

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

The first public release was published on November 9, 2026 as [v1.0.0](https://github.com/AryanGh-imp/DANG/releases/tag/v1.0.0).
