# Release process (Changesets)

This repo uses **Changesets** with a `develop → main` release flow.

## Daily development (feature work)

1. Create a branch from `develop` for the issue:
   - `feature/<issue>-<short-name>` or `chore/<issue>-<short-name>`

2. Do your changes and commit

3. Add a changeset (defines patch/minor/major):
   ```bash
   npm run changeset
   ```

Commit the generated file in `.changeset/` (if it wasn't auto-committed).

4. Push and open a PR to `develop`.
   - In the PR description include: `Closes #<issue>`

## Release to npm

When `develop` is ready to ship:

1. Create a release branch from `develop`:

   ```bash
   git checkout develop && git pull
   git checkout -b release/vX.Y.Z
   ```

2. Apply versions + changelog from accumulated changesets:

   ```bash
   npm run version-packages
   ```

   This updates `package.json` and `CHANGELOG.md`, removes consumed `.changeset/*` files, and auto-commits.

3. Push the release branch and open a PR to `main`:

   ```bash
   git push -u origin release/vX.Y.Z
   gh pr create --base main --head release/vX.Y.Z --title "Release vX.Y.Z"
   ```

4. Merge the PR into `main`.

5. Publishing to npm is handled automatically by the Release workflow (`.github/workflows/release.yml`) on push to `main`. The workflow runs `npm run publish:changesets` using the `NPM_TOKEN` secret. If the token is not configured, publish manually:

   ```bash
   git checkout main && git pull
   npm publish
   ```

6. After publishing, merge `main` back into `develop` to keep them aligned:

   ```bash
   git checkout develop && git merge main && git push
   ```

## Notes

- The **version bump type** (patch/minor/major) is chosen when running `npm run changeset`.
- `changeset version` is only run in the **release branch**, never in CI.
- CI builds/tests/formats on PRs; the Release workflow handles npm publishing.
- The `NPM_TOKEN` secret must be configured in GitHub repository settings for auto-publish.

## Releases

| Version | Date       | Notes                                                                |
| ------- | ---------- | -------------------------------------------------------------------- |
| v1.0.0  | 2026-05-07 | First stable release — 15 parsers, 147 tests, 7/7 corpus files parse |
| v0.7.0  | 2026-01-12 | Last pre-release                                                     |
| v0.6.x  | 2026-01-07 | Build fixes                                                          |
| v0.5.1  | 2026-01-05 | ESM/CJS dual output                                                  |
| v0.4.0  | 2026-01-05 | Builder + domain assembler                                           |
| v0.2.0  | 2026-01-05 | Public API shape                                                     |
| v0.1.x  | 2025-12-16 | Initial alpha                                                        |
| v0.0.x  | 2025-12-15 | Skeleton                                                             |
