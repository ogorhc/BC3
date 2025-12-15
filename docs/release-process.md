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

````

Commit the generated file in `.changeset/` (if it wasn’t auto-committed).

4. Push and open a PR to `develop`.

   * In the PR description include: `Closes #<issue>`

## Release to npm (manual versioning + automatic publish)

When `develop` is ready to ship:

1. Create a release branch from `develop`:

   ```bash
   git checkout develop
   git pull
   git checkout -b release/vX.Y.Z
   ```

2. Apply versions + changelog from accumulated changesets:

   ```bash
   npm run version-packages
   ```

   This will update `package.json` and `CHANGELOG.md` and remove consumed `.changeset/*`.

3. Push the release branch and open a PR to `main`:

   ```bash
   git push -u origin release/vX.Y.Z
   gh pr create --base main --fill
   ```

4. Merge the PR into `main`.

5. Publishing happens automatically on `main` via GitHub Actions:

   * The release workflow runs on `push` to `main`
   * It publishes to npm if the version in `main` is not yet published

## Notes

* The **version bump type** (patch/minor/major) is chosen when running `npm run changeset`.
* `changeset version` is only run in the **release branch**, never in CI.
* CI should only build/test/format; publishing is handled by the release workflow on `main`.
````
