# Complete Task Playbook

## When to Use

General task completion: chores, tooling, documentation, or any work that doesn't fit feature/bug/refactor.

## Steps

### 1. Understand the Task

- Read the task description / issue.
- Clarify scope with user if needed.
- Identify which parts of the repo are affected.

### 2. Plan

- Break into discrete steps.
- Check `docs/ai-workflow/current-handover.md` for conflicts.
- Load relevant skills (`.ai/skills/bc3-development` for code, `typescript-advanced-types` for types).

### 3. Execute

- Follow existing code conventions (see `AGENTS.md`).
- Respect module dependency rules (`docs/architecture/module-boundaries.md`).
- Run `npm run format` after code changes.
- For docs-only changes, skip code verification steps.

### 4. Verify

```bash
npm run ci            # build + format check
```

### 5. Branch & Commit

Branch naming: `chore/<issue>-short-name`.

Changeset only if public API or behavior changes (not needed for docs/CI/internal).

### 6. Complete

Update `docs/ai-workflow/current-handover.md` with outcome.
