# Contributing to BC3

Thank you for your interest in contributing to **BC3**. This document describes the basic contribution rules and workflow.

## Branching model

* `main`: production branch (published to npm)
* `develop`: active development branch

Create one branch per task:

* `feature/<issue>-short-name`
* `bugfix/<issue>-short-name`
* `chore/<issue>-short-name`

## Issues & workflow

* All work must be linked to a GitHub Issue
* Issues are managed through GitHub Projects
* Issue status follows: Check issue → Backlog → Ready → In Progress → In review → Done

## Pull requests

* Open PRs against `develop` (or `main` for CI/tooling-only changes)
* Use the provided PR template
* Link the issue using `Closes #<issue-number>`
* Ensure `npm run ci` passes locally

## Changesets & releases

* Changes affecting the public API or behavior require a changeset:

  ```bash
  npm run changeset
  ```
* Docs, CI, and internal tooling changes do **not** require changesets
* Releases are prepared in a `release/vX.Y.Z` branch and merged into `main`
* Publishing to npm is automated on merges to `main`

## Code style

* TypeScript with strict settings
* Formatting is enforced with Prettier
* Pre-commit hooks validate formatting automatically

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
