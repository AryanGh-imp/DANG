# Contributing to DANG

Contributions should preserve DANG's static hosting model, offline operation, local-data integrity, and Persian/English accessibility. Start with an issue for a substantial behavior or design change. Maintainer: [AryanGh-imp](https://github.com/AryanGh-imp).

## Development workflow

1. Fork or clone the repository and create a descriptive branch.
2. Install the locked toolchain with `npm ci` and run `npm run serve`.
3. Make one coherent change, keeping runtime paths relative and translations consistent.
4. Run appropriate checks. Changes involving storage, imports, reports, or offline behavior should exercise failure paths as well as successful behavior.
5. For appearance changes, review narrow mobile and desktop layouts, keyboard focus, RTL/LTR and contrast. Screenshots must use synthetic data.
6. Update affected documentation, keep the release/precache lists in sync, and change the source worker version for source-server update tests. Pages builds fingerprint published runtime changes automatically.
7. Open a pull request explaining the concrete problem, resulting behavior, and verification performed.

The complete command list is in [development](docs/development.md). Before a release, run `npm run check`, `npm test`, `npm run test:e2e`, `npm run test:webkit`, and `npm run test:pages`.

## Commit and review conventions

Use clear subjects such as `fix(storage): preserve drafts after failed writes` or `feat(calendar): improve selected-day navigation`. Group related code, assets, and verification coherently. Use a body when the motivation, data implications, or validation needs explanation. Avoid splitting a single inseparable change into cosmetic micro-commits.

Keep pull requests focused. Describe changes for a reviewer who has not seen the conversation. Report checks actually performed and any relevant limitations. A browser-engine test does not establish physical-device coverage.

## Data, security, and licensing

Never include personal backups, browser profiles, tokens, or real financial data in issues, screenshots, tests, or commits. Use [SECURITY.md](SECURITY.md) for sensitive vulnerability reports. Preserve migration/recovery behavior and document any schema changes before implementation.

Contributed source and documentation are distributed under the project's MIT license. Third-party files retain their own licenses; record new dependencies or assets in [NOTICE](NOTICE). The brand artwork has separate reuse terms.
