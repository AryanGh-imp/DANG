# GitHub Pages Deployment

## Target and prerequisites

Repository: [AryanGh-imp/DANG](https://github.com/AryanGh-imp/DANG). Maintainer: [AryanGh-imp](https://github.com/AryanGh-imp). Production site: `https://aryangh-imp.github.io/DANG/`.

The current maintenance release is **1.0.1**, identified by the annotated Git tag `v1.0.1`. Preserve the first release's `v1.0.0` tag. Release numbering is separate from the unchanged internal storage and backup format versions.

A local build or push is not evidence of successful deployment. Check the Pages workflow conclusion and the actual hosted assets before announcing a release.

Before a release:

1. Review the local commit history and application preview.
2. Confirm `origin` points to the intended repository and `main` is the release branch.
3. In repository **Settings → Pages**, set **Source: GitHub Actions**.
4. Ensure Actions are enabled and official GitHub actions are permitted by repository policy.
5. Run the validation commands below. Keep a JSON backup before testing an update against a browser containing real expenses.

```sh
git remote -v
git log --oneline --reverse
npm ci
npm run check
npm test
npx playwright install chromium webkit
npm run test:e2e
npm run test:webkit
npm run test:pages
git status --short
```

Audit the entire diff and tracked content for private records, backups, credentials and local artifacts. The Cloudflare site token is an intended public identifier. Publish only after the checks pass; preserve failing results and document any target that is not met. A critical functional or security failure blocks publication.

Commit the reviewed changes, then publish the annotated release tag and `main`:

```sh
git tag -a v1.0.1 -m "DANG v1.0.1 — Quality, Accessibility & Performance Improvements"
git push origin main
git push origin v1.0.1
gh run list --workflow pages.yml --branch main
```

The tag must point to the final release commit. Pages deploys `main`, not tag pushes. Wait for the workflow to succeed and complete the production checks below before creating the GitHub Release:

```sh
gh release create v1.0.1 --verify-tag --title "DANG v1.0.1 — Quality, Accessibility & Performance Improvements" --notes-file RELEASE_NOTES_PATH
```

`RELEASE_NOTES_PATH` denotes a prepared file outside the published artifact. Notes should summarize actual changes, measured validation and known limitations; never claim dashboard ingestion without seeing it. Repository visibility is already public.

## Workflow structure

`ci.yml` runs for pull requests, non-main branch pushes, manual runs, and reusable workflow calls. It checks static references, syntax, store behavior, and the release build. Chromium and WebKit browser jobs run after validation, including cold starts, WCAG 2.1 A label checks, optional analytics failure, and upgrades from the actual `v1.0.0` tag. Browser checkouts fetch release history. Ordinary tests isolate the beacon; dedicated integration tests use the unchanged official script with a local collector to avoid polluting production analytics. Chromium also tests the assembled Pages artifact. Failed jobs retain diagnostic artifacts.

`pages.yml` runs for pushes to `main` and manual runs on `main`. It calls the reusable CI workflow, then assembles `dist/`, configures Pages, uploads the Pages artifact, and deploys it. Deployment waits for every validation and browser job to pass. Official actions are pinned to verified commit hashes with their release versions recorded in comments.

All setup-node steps read `.nvmrc`, which selects Node.js 26 LTS. Default workflow permissions are `contents: read`. Pages configuration/deployment jobs receive `pages: write` where needed; the deployment job also receives `id-token: write`. The workflow uses the `github-pages` environment, which can have repository-managed protection rules. No personal access token or application secret is required.

The deployment concurrency group serializes Pages runs. A manual run on a branch other than `main` is skipped so an unreleased branch cannot replace the live site through that trigger.

## Release artifact

`scripts/site-files.js` defines the release allowlist. `npm run build:pages` checks references and copies application entry files, all `assets/`, `.nojekyll`, `LICENSE`, and `NOTICE` into `dist/`.

It excludes Git metadata, npm dependencies, scripts, tests, repository documentation, screenshots, workflow files, and example backups. The output directory is validated before replacement; linked output directories and asset symlinks are rejected. There is no transpilation or client-side package bundle.

To preview the assembled artifact:

```sh
npm run build:pages
npm run serve:pages
```

Open `http://127.0.0.1:4173/DANG/`. Stop another server using 4173 first, or set a different `PORT`. `npm run test:pages` manages its own artifact server on 4174.

## Updates and cache versions

`npm run build:pages` hashes the names and bytes of the allowlisted published files and stamps `dist/sw.js` with `dang-v<application-version>-<content-hash>`. The application version comes from `package.json`. Identical published content produces the same identity; a runtime change creates a different identity even if the application version has not changed. Source files are not rewritten. Documentation and preview changes are excluded from the fingerprint.

For a future release, update application version/changelog as appropriate, make and verify the change, commit it, and push `main`. The workflow builds and deploys the new fingerprint automatically. Add new runtime modules to the release allowlist and precache list. When serving source files directly during development, also change the source `VERSION` in `sw.js` to test cached updates.

The app checks for updates at startup, after reconnecting, on focus/visibility changes, and every five minutes while visible. A complete new worker waits and presents an **Update app** button. The user selects it to activate the downloaded release and reload the requesting tab without a hard refresh. Saved expenses and settings remain in IndexedDB. Unfinished input, an open editor or an in-flight save postpones reloading; another open tab keeps its draft and gets its own notice. A downloaded update can be applied offline.

Precache requests bypass the HTTP cache. If any release asset is unavailable, the previous offline version stays active. Successful activation removes only caches for this application path. Browser checks run while the app is open and online; a closed app discovers changes on its next visit. An older release without the update UI needs one ordinary reload after the new worker is installed to begin using these controls.

Keep relative application asset paths and manifest `scope`, `id`, and `start_url`. GitHub's path is case-sensitive: `/DANG/` is the production directory. Changing a domain or path creates a different IndexedDB context; export/import a backup to move data.

The canonical URL and sharing image in `index.html` target the Pages URL above. Update those values if moving to a custom domain. A custom domain also requires Pages DNS/configuration changes; no custom domain is configured by this project.

## Rollback

Revert the faulty source commit on `main` and publish the revert through the same CI gate. The build fingerprint changes with the reverted content; keep the current update controller/build tooling when reverting a feature. For direct source deployments, give the worker a new source version. Preserve backup compatibility and test changes involving stored records before publication.

Do not move a published tag or delete user storage to force a rollback. Existing installations receive the reverted release through the same update prompt. Keep the 1.0.1 display bootstrap if reverting unrelated features; its mirror is only a display hint and the database remains authoritative.

## Production verification

Verify HTTPS, the `/DANG/` canonical URL, `application-version` metadata and runtime file bytes against the final commit. Check that the hosted worker has the build fingerprint and registers with the `/DANG/` scope. Exercise English/Gregorian and Persian/Jalali, saved records, navigation, offline reload and reconnection in isolated profiles. Where possible, keep an isolated 1.0.0 session with synthetic records open across deployment and apply the downloaded update; confirm records, preferences and drafts survive.

Run Lighthouse mobile and desktop against the assembled artifact or production, without analytics stubs or rendering instrumentation. Record performance, CLS and the other categories in the release QA report. A simulated mobile profile does not establish physical iPhone/Android installation behavior.

Inspect the live beacon response and collector requests, including navigation and absence of synthetic financial markers. Query-only view navigation is tracked but Cloudflare strips query/hash from reported URLs, so views aggregate under `/DANG/`. Confirm authenticated dashboard visits separately; network acceptance alone does not establish dashboard ingestion. Blocked/offline analytics may produce a browser resource diagnostic but must never cause an application exception or prevent saving. See [privacy](privacy.md).

## Repository presentation

Suggested repository description: “A private, offline-first expense ledger with Persian/English interfaces, Jalali/Gregorian calendars, and an Achaemenid-inspired design.” After the site is live, set the repository website to its Pages URL. Suggested topics include `expense-tracker`, `offline-first`, `pwa`, `github-pages`, `persian`, and `jalali-calendar`.

See [troubleshooting](troubleshooting.md) for failed Pages setup, stale caches, and missing assets.
