# Playbook: Start GitHub Issue

## When to Use

Starting work on any GitHub issue — bug, feature, or documentation.

## Steps

### 1. Fetch the issue from GitHub

```bash
gh issue view <number>
```

### 2. Read the full issue description and comments

### 3. Confirm scope

- Verify the issue is actionable and understood.
- Clarify with the reporter if needed before starting.

### 4. Create a branch

```
fix/<issue-number>-short-description
feat/<issue-number>-short-description
docs/<issue-number>-short-description
```

```bash
git switch -c <type>/<issue-number>-short-name
```

### 5. Read AI context and handover

- `docs/ai-workflow/ai-context.md`
- `docs/ai-workflow/current-handover.md`

### 6. Identify related docs/spec/corpus/tests

- Does the issue touch the parser? → `docs/parser/`, `docs/bc3-knowledge/`
- Does it touch the domain model? → `docs/domain/`
- Does it need corpus analysis? → `data/bc3-corpus/`
- Is there an existing test to extend? → `tests/`

### 7. Create a short implementation plan

- What files will change?
- What tests will be added?
- What docs will be updated?

### 8. Do not modify files before the plan

Show the plan to the user for confirmation before writing any code.
