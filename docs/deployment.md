# GitHub Pages Deployment

## Target and prerequisites

Repository: [AryanGh-imp/DANG](https://github.com/AryanGh-imp/DANG). Maintainer: [AryanGh-imp](https://github.com/AryanGh-imp). Expected site URL: `https://aryangh-imp.github.io/DANG/`.

The first release is **1.0.0**, identified by the annotated Git tag `v1.0.0`. Release numbering is separate from the preserved internal storage and backup format versions.

The project is prepared locally; a prepared checkout is not evidence of a successful hosted deployment. The first publication requires a reviewed push and GitHub Actions execution.

Before the first deployment:

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

When the maintainer is ready to publish, run `git push -u origin main`. This command is an explicit publication step; preparing documentation or committing locally does not perform it.

Publish the reviewed release tag separately with `git push origin v1.0.0`. The tag records the release commit; the Pages workflow deploys `main` rather than tag pushes.

## Workflow structure

`ci.yml` runs for pull requests, non-main branch pushes, manual runs, and reusable workflow calls. It checks static references, syntax, store behavior, and the release build. Chromium and WebKit browser jobs run after validation. Chromium also tests the assembled Pages artifact. Failed jobs retain diagnostic artifacts.

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

## Repository presentation

Suggested repository description: “A private, offline-first expense ledger with Persian/English interfaces, Jalali/Gregorian calendars, and an Achaemenid-inspired design.” After the site is live, set the repository website to its Pages URL. Suggested topics include `expense-tracker`, `offline-first`, `pwa`, `github-pages`, `persian`, and `jalali-calendar`.

See [troubleshooting](troubleshooting.md) for failed Pages setup, stale caches, and missing assets.
