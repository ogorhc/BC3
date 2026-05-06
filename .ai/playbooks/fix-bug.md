# Fix Bug Playbook

## When to Use

Fixing a reported bug or unexpected behavior in the parser, domain model, or API.

## Steps

### 1. Understand the Bug

- Read the bug report. Confirm expected vs actual behavior.
- Identify the affected layer: tokenizer, dispatcher, strategy parser, builder, domain, or API.
- Check if the bug affects `'strict'` mode, `'lenient'` mode, or both.

### 2. Reproduce

- Create a minimal `.bc3` string that triggers the bug.
- Use the tokenizer dev script for quick iteration:

```bash
npm run dev:tokenize
```

- Or write an inline reproduction in `scripts/` (scripts are gitignored).
- Document the reproduction steps in the issue.

### 3. Diagnose Root Cause

- Trace the parsing flow: Tokenizer → Dispatcher → Strategy Parser → Builder → DomainAssembler.
- Check for similar bugs in sibling parsers (fix them too if found).
- Verify module dependency rules aren't violated (`docs/architecture/module-boundaries.md`).

### 4. Implement Fix

- Fix the root cause, not the symptom.
- If the fix touches a parser, review all 14 parsers for the same pattern.
- Do not introduce bypasses around the module dependency rules.

### 5. Verify

```bash
npm run ci            # build + format check
npm run dev:tokenize  # smoke test with sample file
```

If the bug was in a parsing strategy, verify both `'strict'` and `'lenient'` modes.

### 6. Branch & PR

```bash
git checkout develop && git pull
git checkout -b bugfix/<issue>-short-name
```

Add a changeset if the fix changes public behavior:

```bash
npm run changeset
```

PR to `develop`. Use the PR template. Link the issue with `Closes #<number>`.

### 7. Complete

Update `docs/ai-workflow/current-handover.md` with outcome.
