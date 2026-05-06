# Create Feature Playbook

## When to Use

Adding new functionality: new record type, new importer, API extension, domain capability.

## Steps

### 1. Understand Requirements

- Read the GitHub issue. Clarify ambiguity with user.
- Identify acceptance criteria — what must work end-to-end.
- Check if a changeset is needed (public API/behavior change → yes; internal/docs → no).

### 2. Analyze Impact

- Check `docs/architecture/module-boundaries.md` — which layer does the change touch?
- Review existing similar features for patterns (e.g., another record-type parser).
- Identify all files that need changes (parser, store, domain, public API, barrel export).

### 3. Design

- Follow existing patterns: Strategy for parsers, Builder for assembly, Composite for domain.
- Domain types must NOT import from `parsing/`, `builder/`, or `importers/`.
- If introducing a new exported type, scope its path through `src/api/types/PublicApi.ts`.

### 4. Branch & Implement

```bash
git checkout develop && git pull
git checkout -b feature/<issue>-short-name
```

- Add the parser class in `src/parsing/dispatch/parsers/`
- Register it in `src/parsing/dispatch/parsers/createDefaultParsers.ts`
- Extend `BC3ParseStoreData` if new storage fields are needed
- Extend `DomainAssembler` to map store data → domain objects
- Add/update domain types in `src/domain/` (pure, no parser deps)
- Export through `src/index.ts` if public

### 5. Verify

```bash
npm run ci            # build + format check
npm run format        # fix formatting if check fails
```

Optionally smoke-test with `npm run dev:tokenize`.

### 6. Prepare PR

```bash
npm run changeset     # if public API/behavior changed
git add .
git commit
```

PR to `develop`. Use the PR template. Link the issue with `Closes #<number>`.

### 7. Complete

Update `docs/ai-workflow/current-handover.md` with outcome.
