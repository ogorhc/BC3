# Add Tests Playbook

## When to Use

Adding the first tests to the project. There is currently no test framework configured.

## Steps

### 1. Choose a Test Runner

This project has zero runtime dependencies. Choose a test runner that fits:

- **node:test** (Node.js 22+ built-in) — zero deps, lowest friction
- **Vitest** — richer API, watch mode, coverage built-in

Prefer `node:test` to preserve zero runtime dependencies unless the team requests otherwise. Ask before installing a test framework.

### 2. Configure

If using `node:test`:

- No config needed. Add `"test": "node --test src/**/*.test.ts"` to `package.json` scripts.

If using Vitest:

```bash
npm add -D vitest
```

Add `"test": "vitest run"` and `"test:watch": "vitest"` to scripts.

### 3. Structure Tests

Place test files adjacent to source files:

```
src/domain/ConceptNode.ts
src/domain/ConceptNode.test.ts
```

Or in a mirrored `src/__tests__/` structure. Choose one convention and apply consistently.

### 4. What to Test First

Priority order:

1. **Public API** — `BC3.parse()` with known-good and known-bad inputs
2. **Tokenizer** — record boundary detection, field splitting, escape handling
3. **Strategy parsers** — one representative parser (~V or ~C)
4. **Domain model** — `ConceptNode` tree navigation, `Decomposition` relationships
5. **Builder/Assembler** — end-to-end parse → domain construction

### 5. Write Tests

- Use real BC3 content strings (not mocks). Start with `scripts/file.bc3`.
- Test both `'strict'` and `'lenient'` modes.
- Test edge cases: empty input, malformed records, missing fields, extra delimiters.
- Test hierarchy: parent/child/ancestor navigation on parsed documents.

### 6. Verify

```bash
npm test
npm run ci            # ensure build + format still pass
```

### 7. Update CI

Add `npm test` to the CI workflow (`.github/workflows/ci.yml`):

```yaml
- run: npm test
```

### 8. Complete

Update `docs/ai-workflow/current-handover.md`. Update `AGENTS.md` to remove the "no tests" warning.
