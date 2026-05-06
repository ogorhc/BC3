# Refactor Safely Playbook

## When to Use

Restructuring code without changing external behavior: renaming, moving files, extracting utilities, simplifying logic.

## Steps

### 1. Define Scope

- Identify what's being refactored and what's off-limits.
- Confirm the public API (`src/api/`, `src/index.ts`) must not break.
- Check `docs/public-api.md` for the API contract.

### 2. Audit Dependencies

- Map all imports in and out of affected files.
- Run a search for every exported symbol being changed:

```bash
rg "export.*OldName" src/
rg "from.*OldFile" src/
```

- Verify no module boundary rules are violated by the refactor (`docs/architecture/module-boundaries.md`).

### 3. Plan the Change Order

Refactor bottom-up through the dependency graph:

```
utils → domain → builder → parsing → importers → api
```

Domain has no deps — start there. API is the surface — change last. Never refactor a file before its dependents.

### 4. Execute Incrementally

- Change one file at a time.
- After each file, run:

```bash
npm run ci            # build + format check
```

- If the build breaks, fix before moving to the next file.
- Use `npm run format` after each change.

### 5. Verify No Breakage

| Check      | Command                |
| ---------- | ---------------------- |
| Build      | `npm run build`        |
| Format     | `npm run check-format` |
| Smoke test | `npm run dev:tokenize` |

If tests exist, run them too: `npm test`.

### 6. Handle Breaking Changes

If the refactor must change the public API:

1. Add a changeset: `npm run changeset`
2. Document the migration in the PR description
3. Update `README.md` or relevant docs

### 7. Complete

Update `docs/ai-workflow/current-handover.md`. PR to `develop`.
