# Playbook: Finish GitHub Issue

## When to Use

Completing work on a GitHub issue before opening a PR.

## Steps

### 1. Run relevant tests

```bash
npm test
npm run ci
```

### 2. Update documentation if behavior changed

- `docs/bc3-knowledge/known-edge-cases.md` — new edge cases
- `docs/bc3-knowledge/parser-behavior.md` — if parser capabilities changed
- `docs/parser/record-parsers.md` — if a parser was added or modified

### 3. Update `docs/ai-workflow/current-handover.md`

Record the outcome, including:

- Issue number
- Branch name
- Summary of changes
- PR link (once created)

### 4. Commit with Conventional Commits

```
fix: short description
feat: short description
docs: short description
```

Reference the issue in the commit body: `Fixes #<number>`

### 5. Prepare PR description

Include:

- `Closes #<issue>` or `Fixes #<issue>`
- Summary — what the PR does in 1-2 sentences
- Root cause — if a bug fix
- Changes — list of files and what changed
- Tests — what tests were added/modified
- Risks — any known limitations or follow-up work

### 6. Leave next recommended issue

Update `docs/ai-workflow/current-handover.md` with the next issue to pick up.
