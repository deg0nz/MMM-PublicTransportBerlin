# Changelog

All notable changes to this project will be documented in this file. The versions before 2.1.3 have to be reconstructed from the git history.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
