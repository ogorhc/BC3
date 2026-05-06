# Review PR Playbook

## When to Use

Reviewing a pull request for this repository.

## Steps

### 1. Understand Context

- Read the PR description and linked issue.
- Identify the type: Feature / Bug fix / Refactor / Docs / Chore.
- Check if the PR includes a changeset (required for public API/behavior changes).

### 2. Build & Verify

```bash
gh pr checkout <number>
npm run ci            # build + format check
```

If `npm run ci` fails, request changes before reviewing further.

### 3. Review by Concern

Check each layer touched:

**Domain (`src/domain/`):**

- Must not import from `parsing/`, `builder/`, or `importers/`.
- Domain types must remain pure.

**Parsing (`src/parsing/`):**

- Must not import from `api/`.
- If adding a new record type, is it registered in `createDefaultParsers.ts`?

**Builder (`src/builder/`):**

- Must not import from `api/` or `parsing/`.
- `DomainAssembler` must map store data correctly.

**API (`src/api/`):**

- Must not contain business logic.
- Public types must be in `src/api/types/PublicApi.ts`.
- New exports must be in `src/index.ts`.

**Style:**

- Prettier formatting enforced (already checked by `npm run ci`).
- TypeScript strict flags not relaxed (`noUncheckedIndexedAccess`, `noImplicitOverride`).

### 4. Provide Feedback

- Be specific and constructive.
- Flag any module boundary violations — these are hard blocks.
- Flag missing changesets if public API/behavior changed.

### 5. Complete

Approve or request changes. Close the review.
