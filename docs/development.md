# Development Guide

## Requirements

- Node.js 24 LTS is the project baseline (`.nvmrc`); `package.json` permits Node.js 22 or newer.
- npm and the committed lockfile provide reproducible development dependencies.
- Chrome or Playwright Chromium for the full browser suite; Playwright WebKit for Safari-engine design checks.
- Python 3 and Pillow only when regenerating brand images. They are not required to run or deploy DANG.

Install dependencies with `npm ci`. Run the application using `npm run serve`, then open `http://127.0.0.1:4173/Dang/`. This URL preserves the established local development path. `/DANG/` is also available to reproduce the case-sensitive Pages path.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the locked development dependency tree |
| `npm run serve` | Serve source files on localhost, default port 4173 |
| `npm run check` | Validate JavaScript syntax, local references, release files, manifest icons, cache entries and sample backup |
| `npm test` | Run store and validation tests with fake IndexedDB |
| `npm run test:e2e` | Run Chromium behavior, design and Pages-path tests |
| `npm run test:webkit` | Run design tests in WebKit |
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

Use `.editorconfig` for UTF-8 and LF conventions; `.gitattributes` keeps binary assets intact. Update `sw.js` whenever cached runtime files change. Add verification that exercises user behavior or a material failure mode, and review screenshots for visual changes.

## Regenerate brand assets

```sh
python -m pip install Pillow
python scripts/build-brand.py
```

The script preserves the source emblem and derives the WebP, portrait icons, padded maskable icon, and social card. If the original root-level upload exists, it is moved only when the preserved destination does not already exist. See [NOTICE](../NOTICE) for artwork licensing.
