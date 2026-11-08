# Troubleshooting

## The application is blank when opened as a file

Run `npm run serve` and open the localhost URL. JavaScript modules and service workers require HTTP/HTTPS; `file://` is not a supported launch path. Check the browser console for missing files or blocked IndexedDB access.

## Expenses appear missing after deployment or a URL change

Check the browser profile, hostname, protocol, and application directory. IndexedDB is scoped by origin and DANG additionally scopes its database by path. `/Dang/` and `/DANG/` are distinct. Export a JSON backup from the original context and restore it in the new context. Clearing the browser's site data is not a recovery step.

## A save fails or changes from another tab appear

DANG retains input when a write fails. Browser quota limits, disabled storage, or another tab holding a database upgrade can prevent a write. Export existing data if possible, check storage settings, and retry after resolving the condition. A concurrent edit conflict means the original expense changed in another tab; reopen the latest expense before editing again.

## A backup is rejected

Use a JSON backup, not a CSV, print report, or arbitrary recovery file. Check numeric amounts, valid ISO dates, supported settings, safe category keys, and six-digit hex colors. The file picker rejects files larger than 20,000,000 bytes. See [backup format](data-format.md). Invalid imports do not partially change existing data.

## Offline mode is unavailable

Load the app online over HTTPS or localhost and wait for the offline-ready status. All precache files must exist with correct MIME types before the worker can install. Browser privacy settings and private sessions may restrict service workers or storage. Offline operation cannot begin before a successful initial installation.

## A new design still looks like the previous release

Verify that the runtime change included a new `sw.js` version. An open page keeps its loaded code while a new worker installs; reload after installation. Inspect the worker's installation errors if it cannot cache an asset. Keep expense backups before clearing any site data; changing the static cache and deleting IndexedDB are different operations.

## PDF or clipboard export does not complete

PDF export opens a print preview. Use the browser's Print dialog and choose Save as PDF, or the platform's equivalent. On mobile, available print/share destinations depend on the OS. Keep the preview open and use its Print control if the first print call was blocked. Clipboard export requires browser permission and a supported secure context; downloading JSON or CSV remains an alternative.

## Browser tests cannot launch

Run `npx playwright install chromium webkit`. On Linux use `--with-deps` to install required system libraries. The Windows Chromium config uses installed Google Chrome at its standard path when available. Close only the server you own when 4173 or 4174 is already in use; do not terminate unrelated Node processes.

## GitHub Pages configuration or deployment fails

Confirm repository Settings → Pages uses GitHub Actions, Actions are enabled, and the workflow has the required Pages/OIDC permissions. The production path is `/DANG/`. Check validation and browser job logs first: deployment intentionally waits for both engines and the artifact tests. Missing assets must be fixed in source and in the worker cache list before retrying. See [deployment](deployment.md).
