# Troubleshooting

## The application is blank when opened as a file

Run `npm run serve` and open the localhost URL. JavaScript modules and service workers require HTTP/HTTPS; `file://` is not a supported launch path. Check the browser console for missing files or blocked IndexedDB access.

## Expenses appear missing after deployment or a URL change

Check the browser profile, hostname, protocol, and application directory. IndexedDB is scoped by origin and DANG additionally scopes its database by path. `/Dang/` and `/DANG/` are distinct. Export a JSON backup from the original context and restore it in the new context. Clearing the browser's site data is not a recovery step.

## A save fails or changes from another tab appear

DANG retains input when a write fails. Browser quota limits, disabled storage, or another tab holding a database upgrade can prevent a write. Export existing data if possible, check storage settings, and retry after resolving the condition. A concurrent edit conflict means the original expense changed in another tab; reopen the latest expense before editing again.

## The interface opens in an unfamiliar language

Use the globe button in the page header: **English** switches to English and **فارسی** switches to Persian. It is available in every view, including on phones. The saved choice overrides browser language detection on future visits. Language changes keep your current calendar; use Settings if you also want to change the calendar.

## A backup is rejected

Use a JSON backup, not a CSV, print report, or arbitrary recovery file. Check numeric amounts, valid ISO dates, supported settings, safe category keys, and six-digit hex colors. The file picker rejects files larger than 20,000,000 bytes. See [backup format](data-format.md). Invalid imports do not partially change existing data.

## Offline mode is unavailable

Load the app online over HTTPS or localhost and wait for the offline-ready status. All precache files must exist with correct MIME types before the worker can install. Browser privacy settings and private sessions may restrict service workers or storage. Offline operation cannot begin before a successful initial installation.

## A new design still looks like the previous release

Reconnect or return to the page and look for **Update app**. Visible pages also check every five minutes. Save or clear unfinished input and close an editor before selecting the update button. Other tabs can update independently. A regular reload alone can still use the previous version while a downloaded worker is waiting for that action.

Confirm the Pages workflow succeeded and deployed the fingerprinted `dist/` output. For direct source-server testing, change the source worker version. If no update appears, inspect worker installation errors and missing precache assets; a failed download intentionally keeps the previous offline version. Keep expense backups before clearing any site data.

## PDF or clipboard export does not complete

PDF export opens a print preview. Use the browser's Print dialog and choose Save as PDF, or the platform's equivalent. On mobile, available print/share destinations depend on the OS. Keep the preview open and use its Print control if the first print call was blocked. Clipboard export requires browser permission and a supported secure context; downloading JSON or CSV remains an alternative.

## Cloudflare Analytics is blocked or the dashboard has no visits

The ledger remains usable when the optional beacon is blocked or offline. Browser-generated failed-resource messages can describe this optional request; they are different from application exceptions or failed expense saves. Confirm the live HTML includes one official script with the intended public site token, then inspect actual requests to `cloudflareinsights.com/cdn-cgi/rum`. Ad blockers, network restrictions and dashboard ingestion delays can affect analytics.

The current beacon strips query parameters, so internal `?view=` changes appear under the same application path rather than as individually named sections. A successful collector request does not by itself prove that data has appeared in the authenticated dashboard. Check the correct site and time range there before claiming ingestion. See [privacy](privacy.md).

The provider's collector can reject a localhost origin that includes a development port with a CORS mismatch. This may lower a local Lighthouse Best Practices score despite a working ledger. Verify delivery on the configured HTTPS production origin; do not disable the beacon or weaken browser security to hide the local diagnostic.

## Browser tests cannot launch

Run `npx playwright install chromium webkit`. On Linux use `--with-deps` to install required system libraries. The Windows Chromium config uses installed Google Chrome at its standard path when available. Close only the server you own when 4173 or 4174 is already in use; do not terminate unrelated Node processes.

## GitHub Pages configuration or deployment fails

Confirm repository Settings → Pages uses GitHub Actions, Actions are enabled, and the workflow has the required Pages/OIDC permissions. The production path is `/DANG/`. Check validation and browser job logs first: deployment intentionally waits for both engines and the artifact tests. Missing assets must be fixed in source and in the worker cache list before retrying. See [deployment](deployment.md).
