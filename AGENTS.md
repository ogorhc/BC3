# AGENTS.md

Instructions for AI agents working in this repo.

## Build & verify

```bash
npm run build        # tsup bundles ESM + CJS + DTS into dist/
npm run check-format # prettier --check .
npm run ci           # build + format check (same as CI)
npm run format       # prettier --write .
npm test             # node:test via tsx — runs tests/**/*.test.ts
npm run test:watch   # same but in watch mode
```

TypeScript type-checking only happens during the tsup build. There is no standalone `typecheck` command.

### Test framework

Tests use `node:test` (Node.js built-in) with `tsx` as a TypeScript loader. Test files live in `tests/` mirroring `src/` structure. Run `npm test` before committing any parser change.

## Architecture

This is a **zero-dependency, ESM-native TypeScript library** (`"type": "module"` in package.json). Single entrypoint: `src/index.ts` (barrel export). Build target: ES2022.

### Module dependency rules (strict)

| Module       | May import from                             |
| ------------ | ------------------------------------------- |
| `api/`       | `importers/`, `domain/`                     |
| `importers/` | `parsing/`, `builder/`, `domain/`, `utils/` |
| `parsing/`   | `builder/`, `domain/`, `utils/`             |
| `builder/`   | `domain/`, `utils/`                         |
| `domain/`    | nothing                                     |
| `utils/`     | nothing                                     |

Disallowed: `domain/` importing from parsing/builder/importers, `utils/` importing from domain, `parsing/` importing from `api/`. See `docs/architecture/module-boundaries.md`.

### Flow

```
API (BC3.parse) → Importer → Tokenizer → Dispatcher → Strategy parsers
                         → Builder (BC3ParseStore) → DomainAssembler → BC3Document
```

There are 14 per-record-type parsers (~V through ~E, plus UnknownRecordParser). Parsing mode defaults to `'lenient'` (collects diagnostics); `'strict'` fails on first error.

## Git workflow

- `main` — production/npm
- `develop` — active development (PR here)
- Branch naming: `feature/<issue>-short-name`, `bugfix/<issue>-short-name`, `chore/<issue>-short-name`

**Before merging**, add a changeset if the PR changes public API or behavior:

```bash
npm run changeset
```

Docs/CI/internal-only changes do not need a changeset. See `docs/development/release-process.md`.

## Style

- Prettier (enforced by husky pre-commit hook via lint-staged): single quotes, trailing commas, 80 print width, LF line endings
- TypeScript strict mode with `noUncheckedIndexedAccess` and `noImplicitOverride` enabled — do not relax these
- No ESLint configured; formatting is the only code-style enforcement beyond the TS compiler

## AI workflow (mandatory)

Before implementing any task, follow these steps in order:

1. **Read context**: `docs/ai-workflow/ai-context.md` — understand the project
2. **Read handover**: `docs/ai-workflow/current-handover.md` — check for active work, blockers, recent changes
3. **Choose playbook**: select the matching playbook from `.ai/playbooks/` (`create-feature.md`, `fix-bug.md`, `review-pr.md`, `complete-task.md`, `analyze-bc3-sample.md`) and follow its steps
4. **Apply skills**: if the task matches a skill in `.ai/skills/` or `.agents/skills/`, load it
5. **Follow cursor rules**: obey `.cursor/rules/ai-workflow.mdc`
6. **Update handover**: before finishing, update `docs/ai-workflow/current-handover.md` with the outcome

When modifying code that depends on external libraries, use Context7 to check library APIs before writing code.

The workflow index is at `docs/ai-workflow/index.md`.

## Skills

Skills provide specialized instructions and workflows for specific tasks.
Use the `skill` tool to load a skill when a task matches its description.

| Skill                       | Location          | Relevance                                                                            |
| --------------------------- | ----------------- | ------------------------------------------------------------------------------------ |
| `bc3-parser`                | `.ai/skills/`     | Project-specific: parser modification rules, fixture requirements, edge case docs    |
| `bc3-corpus-analysis`       | `.ai/skills/`     | Project-specific: analyzing BC3 sample files, cataloging types, edge case detection  |
| `bc3-development`           | `.ai/skills/`     | Project-specific: parser architecture, adding record types, domain model conventions |
| `typescript-advanced-types` | `.agents/skills/` | Generics, conditional/mapped/template literal types, discriminated unions            |
| `nodejs-best-practices`     | `.agents/skills/` | Async patterns, module system, error handling, security principles                   |
| `nodejs-backend-patterns`   | `.agents/skills/` | Not applicable (framework/API patterns; this is a parsing library)                   |

## Key docs

| Topic                    | File                                     |
| ------------------------ | ---------------------------------------- |
| Module boundaries & deps | `docs/architecture/module-boundaries.md` |
| Domain model             | `docs/domain/model.md`                   |
| BC3 grammar              | `docs/parser/grammar.md`                 |
| Parsing modes            | `docs/parser/parsing-modes.md`           |
| Release process          | `docs/development/release-process.md`    |
| Public API contract      | `docs/public-api.md`                     |

## GitHub Issue Workflow

For every new task:

1. Fetch the GitHub issue first.
2. Work only on the selected issue.
3. Create a branch using the issue number (e.g. `fix/87-short-name`).
4. Keep changes scoped to the issue.
5. Reference the issue in commits and PR description (e.g. `Fixes #87`).
6. Update `docs/ai-workflow/current-handover.md` with:
   - Issue number
   - Branch name
   - PR link if available
   - Next GitHub issue recommended
