# Development Guide

## Requirements

- Node.js 26 LTS is the project baseline (`.nvmrc`); `package.json` requires Node.js 26 or newer. CI reads `.nvmrc` directly so its selected major version stays consistent with local development.
- npm and the committed lockfile provide reproducible development dependencies.
- Chrome or Playwright Chromium and Playwright WebKit for independent functional, design, language, analytics and update suites.
- Python 3 and Pillow only when regenerating brand images. They are not required to run or deploy DANG.

Install dependencies with `npm ci`. Run the application using `npm run serve`, then open `http://127.0.0.1:4173/Dang/`. This URL preserves the established local development path. `/DANG/` is also available to reproduce the case-sensitive Pages path.

Use a checkout that contains the `v1.0.0` tag when running the actual upgrade regression (`git fetch --tags` if needed). CI's browser checkout fetches the release history for this test.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the locked development dependency tree |
| `npm run serve` | Serve source files on localhost, default port 4173 |
| `npm run check` | Validate JavaScript syntax, local references, release files, manifest icons, cache entries and sample backup |
| `npm test` | Run storage, validation and release fingerprint tests |
| `npm run test:e2e` | Run Chromium behavior, design and Pages-path tests |
| `npm run test:webkit` | Run functional, design, language, analytics and update tests in WebKit |
| `npm run build:pages` | Validate and assemble the allowlisted static release in `dist/` |
| `npm run serve:pages` | Serve the assembled `dist/` artifact, default port 4173 |
| `npm run test:pages` | Assemble and test the release artifact on port 4174 |

The `PORT` environment variable changes the local server port. Playwright's default suite expects 4173 and the artifact suite expects 4174. The two suites have separate output directories and servers.

## Browser tests

```sh
npx playwright install chromium webkit
npm run test:e2e
npm run test:webkit
npm run test:pages
```

Linux CI installs browser system libraries with `--with-deps`. The Chromium config automatically uses Google Chrome at its standard Windows installation path when present. Otherwise it launches the Playwright browser. WebKit uses its own launch settings.

Tests create independent browser contexts and synthetic expenses. Do not seed demonstration data into a browser profile containing personal expenses. The screenshot test refreshes `docs/previews/` intentionally; review those changes before committing them. Reports and screenshots under `test-results*/` and `playwright-report/` are ignored.

Coverage includes transaction rollback, stale tabs and edit conflicts, malformed backups, migration recovery, search normalization, CSV safety, report calculations, date boundaries, escaped print output, offline reloads, theme contrast, mobile target sizing, history navigation, and long content. The artifact suite also checks that repository metadata and example backups are not deployed.

The language suite uses fresh English, Persian and unsupported-language contexts to verify initial language/calendar selection. Chromium and WebKit also exercise keyboard access to the header switch, preservation of expense drafts and leap-day dates, offline preference persistence, Settings synchronization, saved legacy preferences and failed language writes. The default browser-test locale is explicitly Persian so existing behavior checks remain independent of the host's language.

The update suite serves two isolated releases with long-lived HTTP-cache headers. It verifies the update banner, complete precaching, one-button activation, saved data, draft protection in requesting/other tabs and during delayed activation, offline activation, cache isolation and recovery from a missing release asset. Release fingerprint checks prove that runtime changes invalidate the cache without depending on a manual version edit.

Preview capture creates `docs/previews/en/` with English/Gregorian data and `docs/previews/fa/` with Persian/Jalali data, including translated descriptions and localized currency labels. Mobile captures use a 390 × 844 viewport with `fullPage: false`; the main phone preview shows the calendar and asserts that fixed navigation remains at the bottom. Desktop, dark and report captures may include the full document. Review each language set visually after regenerating it.

## Version 1.0.1 regressions and analytics

`startup.spec.js` checks English/Persian cold starts while the application module is delayed, saved-language rendering, localized accessible descriptions, the credit link, malformed display hints and optional hint-write failures. Accessibility checks now include `wcag21a`, alongside the existing A/AA tags. Visible expense-row labels and compact calendar labels remain part of their accessible names.

`upgrade.spec.js` serves the actual tagged v1.0.0 files followed by the current release with long-lived HTTP cache headers. It verifies protected drafts, retained records/custom settings/recovery data, new worker/cache identity and offline reload after activation. The existing multi-tab and incomplete-install update cases remain required.

Ordinary functional tests use an empty optional analytics script through `fixtures.js` to avoid polluting the maintainer's dashboard. `analytics.spec.js` downloads the current official Cloudflare script, preserves its code and HTML token, and directs its collector to a real isolated HTTP server with correct CORS responses. It verifies history navigation, payload privacy with synthetic markers, and blocked-script/offline behavior. Only production checks against the real Cloudflare endpoint establish delivery; a mocked/local collector does not prove dashboard ingestion. Analytics integration tests require network access to fetch the official script.

For performance, assemble `dist/`, serve it without test instrumentation, and run separate Lighthouse mobile and desktop profiles in fresh browser storage. Keep actual scores, CLS, first/large-content paint and raw reports; do not suppress the beacon or hide content to improve metrics. Compare with the v1.0.0 baseline (mobile performance 77 / CLS 0.437, desktop 75 / CLS 0.835). Targets are performance ≥90, CLS ≤0.1 and accessibility/best-practices/SEO 100. Report environmental variability or unmet targets explicitly.

After deployment, compare runtime assets with the final Git commit, inspect the stamped worker and `/DANG/` scope, exercise both languages and offline recovery, inspect real analytics requests for private data, and verify workflow/release status. Dashboard ingestion requires authenticated dashboard evidence; report it as unverified when access is unavailable. Preserve original failing runs separately from corrected runs.

## Repository structure

```text
.github/                  CI, Pages, issue forms and PR template
assets/branding/          Preserved emblem and generated web/app assets
assets/css/               Responsive styles and theme tokens
assets/fonts/             Self-hosted Vazirmatn and OFL notice
docs/                     English technical and user documentation
docs/previews/            Screenshots with synthetic data
examples/                 Synthetic backup example, excluded from deployment
schemas/                  Informative JSON backup schema
scripts/                  Development server, checks and release assembly
tests/                    Storage, behavior, design and deployment tests
README.md                 Main English README
README.fa.md              Persian README
```

## Editing conventions

Keep runtime imports and asset paths relative so the app works under a repository subpath. Maintain Persian and English UI strings together. Preserve current and legacy data formats unless a documented migration is implemented. Use existing CSS custom properties and theme definitions for appearance changes.

Use `.editorconfig` for UTF-8 and LF conventions; `.gitattributes` keeps binary assets intact. The Pages build fingerprints cached runtime changes automatically. Update the source `sw.js` version when testing updates through the source server, and keep both release and precache lists in sync when adding modules. Add verification that exercises user behavior or a material failure mode, and review screenshots for visual changes.

`npm run check` rejects a published JavaScript module that is missing from the worker precache, so a new feature module cannot silently break offline imports.

## Regenerate brand assets

```sh
python -m pip install Pillow
python scripts/build-brand.py
```

The script preserves the source emblem, creates 180/360/540-pixel WebP hero images and 64/128/192-pixel brand portraits, and optimizes PNG installation icons with 256-color palettes. It reports before/after bytes and RGB PSNR so visual changes can be reviewed. Alpha-aware quantization preserves transparency when present; the maskable/social canvases retain their intended backgrounds. If the original root-level upload exists, it is moved only when the preserved destination does not already exist. See [NOTICE](../NOTICE) for artwork licensing.
