# GitHub Pages Deployment

## Target and prerequisites

Repository: [AryanGh-imp/DANG](https://github.com/AryanGh-imp/DANG). Maintainer: [AryanGh-imp](https://github.com/AryanGh-imp). Expected site URL: `https://aryangh-imp.github.io/DANG/`.

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

## Workflow structure

`ci.yml` runs for pull requests, non-main branch pushes, manual runs, and reusable workflow calls. It checks static references, syntax, store behavior, and the release build. Chromium and WebKit browser jobs run after validation. Chromium also tests the assembled Pages artifact. Failed jobs retain diagnostic artifacts.

`pages.yml` runs for pushes to `main` and manual runs on `main`. It calls the reusable CI workflow, then assembles `dist/`, configures Pages, uploads the Pages artifact, and deploys it. Deployment waits for every validation and browser job to pass. Official actions are pinned to verified commit hashes with their release versions recorded in comments.

Default workflow permissions are `contents: read`. Pages configuration/deployment jobs receive `pages: write` where needed; the deployment job also receives `id-token: write`. The workflow uses the `github-pages` environment, which can have repository-managed protection rules. No personal access token or application secret is required.

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

Before releasing changes to HTML, CSS, JavaScript, fonts, icons, or the manifest, change the unique `VERSION` in `sw.js`. The worker installs only when all precache entries are available. It then removes the old cache for the same path. An already open page retains its loaded code; reload after installation to use the new release.

Keep relative application asset paths and manifest `scope`, `id`, and `start_url`. GitHub's path is case-sensitive: `/DANG/` is the production directory. Changing a domain or path creates a different IndexedDB context; export/import a backup to move data.

The canonical URL and sharing image in `index.html` target the Pages URL above. Update those values if moving to a custom domain. A custom domain also requires Pages DNS/configuration changes; no custom domain is configured by this project.

## Rollback

Revert the faulty source commit on `main`, use a new service-worker version even when restoring older code, and publish the revert through the same CI gate. Reusing an old cache version can prevent clients from receiving the rollback. Preserve backup compatibility and test changes involving stored records before publication.

## Repository presentation

Suggested repository description: “A private, offline-first expense ledger with Persian/English interfaces, Jalali/Gregorian calendars, and an Achaemenid-inspired design.” After the site is live, set the repository website to its Pages URL. Suggested topics include `expense-tracker`, `offline-first`, `pwa`, `github-pages`, `persian`, and `jalali-calendar`.

See [troubleshooting](troubleshooting.md) for failed Pages setup, stale caches, and missing assets.
