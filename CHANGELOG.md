# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [2.2.1](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.2.0...v2.2.1) (2026-08-23)

### Chores

* add allowScripts config ([44e7cda](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/44e7cda8bdb555bf729b5d0180f47293e003b311))
* update devDependencies ([df3a28f](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/df3a28ff81d0972743eca3ebf5ac2b0076758621))
* update GitHub Actions ([8607d8c](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/8607d8c47bb067f7dfaf94605f163bb679434625))

### Code Refactoring

* remove obsolete station/stop fallback in debug logging ([07c303d](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/07c303d72a6649d3a21805ecd0b08c97ab28c984))
* remove redundant logLevel check before printDeparture ([8b03af2](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/8b03af2842901b74c78e281048f82a36388b1d1d))
* simplify refineProducts and inline arrayUnique ([593fcaa](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/593fcaad22786c013ac2d5fa1093ef764e0ba097))
## [2.2.0](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.12...v2.2.0) (2026-05-13)


### Added

* add the option to exclude directions ([#350](https://github.com/deg0nz/MMM-PublicTransportBerlin/issues/350)) ([cdff057](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/cdff057645ff5e92d12e45c278b5303682f471e8))


### Fixed

* **fetcher:** use static comparator for departure sort ([a5b6c63](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/a5b6c63d6e1e7e40a47b5c466ed931c1ce5310c8))
* fix wrongly calculated first reachable departure position ([#352](https://github.com/deg0nz/MMM-PublicTransportBerlin/issues/352)) ([86ab952](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/86ab952e49a6f5731c153946344e99b0ad760457))


### Chores

* add release script with commit-and-tag-version ([ea65b91](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/ea65b918d4dd33d552de0e7514ebc9baec89e162))
* replace husky with simple-git-hooks ([ec14959](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/ec14959e3e70832b6a73b0b666aeae4ad598481f))
* update devDependencies ([2659547](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/2659547f0f7a709b554d9c2c33168ec640153a62))


### Tests

* **fetcher:** add unit tests for filters and options ([bf13f21](https://github.com/deg0nz/MMM-PublicTransportBerlin/commit/bf13f214cf24e9dec9d55480818d6b399ef73294))

## [2.1.12](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.11...v2.1.12) (2026-03-15)

- chore: change runner from ubuntu-latest to ubuntu-slim for automated tests
- chore: update dependencies and github actions
- chore: update ESLint config regarding stylistic.configs.all
- fix: localization issue (#341)
- fix: remove dayjs to prevent conflict with other modules

## [2.1.11](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.10...v2.1.11) (2025-07-11)

- chore: add missing "type" field in package.json
- chore: update devDependencies
- refactor: rename `style.css` to `MMM-PublicTransportBerlin.css` for better debugging

## [2.1.10](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.9...v2.1.10) (2025-07-06)

- chore: use `node --run` to run scripts
- chore: update devDependencies
- refactor: simplify linting setup by replacing `stylelint` and `markdownlint` with ESLint plugins

## [2.1.9](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.8...v2.1.9) (2025-06-01)

- chore: update devDependencies
- docs: remove link to not existing video

## [2.1.8](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.7...v2.1.8) - 2025-05-17

- chore: review linter setup
- chore: update devDependencies

## [2.1.7](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.6...v2.1.7) - 2025-05-01

- chore: update devDependencies
- chore: optimize ESLint rules
- docs: update `npm ci` command to omit dev dependencies
- refactor: simplify string checks in `trimDirectionString` method
- refactor: optimize handling of option `directionStationId` for consistency and better logging
- refactor: remove unused `timezone` option
- refactor: remove old deprecation warning about `delay` option which was removed in 2018

## [2.1.6](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.5...v2.1.6) - 2025-04-13 - Maintenance update

- chore: update prepare script message about `husky` for clarity
- chore: update dependencies
- chore: resolve new ESLint warning

## [2.1.5](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.4...v2.1.5) - 2025-03-16 - Maintenance update

- refactor: Replace 'moment' with 'dayjs' for date handling. Reason: ['moment' is considered as legacy](https://momentjs.com/docs/#/-project-status/), 'dayjs' is a modern alternative.
- refactor: Reverse negated condition
- chore: Simplify stylelint-prettier config
- chore: Polish ESLint rules
- chore: Update devDependencies

## [2.1.4](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.3...v2.1.4) - 2025-03-01 - Maintenance update

- Update dependencies incl. `hafas-client`
- Add cspell and fix typos
- Add Code of Conduct
- chore: Optimize logging
- chore: Simplify ESLint call
- chore: Simplify ESLint @stylistic config
- chore: Remove unused release script
- chore: Add husky and lint-staged
- chore: Remove superfluous "prettier-ignore"

## [2.1.3](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.2...v2.1.3) - 2024-12-18 - Maintenance update

- chore: Add CHANGELOG
- chore: Update dependencies incl. `hafas-client`
- chore: Switch node-version from 22 to lts in `automated-tests.yaml`

## [2.1.2](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.1...v2.1.2) - 2024-12-11

## [2.1.1](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.1.0...v2.1.1) - 2024-10-07

## [2.1.0](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.0.2...v2.1.0) - 2024-09-19

## [2.0.2](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.0.1...v2.0.2) - 2024-03-16

## [2.0.1](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v2.0.0...v2.0.1) - 2024-02-10

## [2.0.0](https://github.com/deg0nz/MMM-PublicTransportBerlin/compare/v1.7.3...v2.0.0) - 2023-06-20

- chore: Update to `hafas-client@6`

---

The versions before 2.1.3 have to be reconstructed from the git history.
