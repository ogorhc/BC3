# AI Workflow — BC3 Parser

## Overview

This repository uses an AI-first workflow specialized for parser development. Every agent task must follow the rules below before touching code.

## Mandatory Startup Sequence

Before implementing any task:

1. **Read context:** `docs/ai-workflow/ai-context.md`
2. **Read handover:** `docs/ai-workflow/current-handover.md`
3. **Select playbook** from `.ai/playbooks/`
4. **Load relevant skill** from `.ai/skills/` or `.agents/skills/`
5. **Update handover** before finishing

## Project Rules (hard)

Agents must obey these rules in all code changes:

1. **BC3 files are reference corpus** — never modify files under `data/bc3-corpus/samples/`
2. **No parser changes without fixture tests** — create BC3 string fixtures before modifying any parser, tokenizer, or domain assembler
3. **Preserve unknown records** — UnknownRecordParser must capture content, not discard it. New record types should be stored, not dropped
4. **Document edge cases first** — every parser behavior change must be accompanied by updates to `docs/bc3-knowledge/known-edge-cases.md`
5. **Module boundaries are hard blocks** — see `docs/architecture/module-boundaries.md`; domain must not import from parsing/builder
6. **Never relax TypeScript strict flags** — `noUncheckedIndexedAccess` and `noImplicitOverride` stay on

## Playbooks

| Playbook                | When to use                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `create-feature.md`     | Adding a new record type parser, importer, or API method    |
| `fix-bug.md`            | Fixing a parser/tokenizer/domain bug                        |
| `review-pr.md`          | Reviewing a pull request                                    |
| `complete-task.md`      | Chores, tooling, docs                                       |
| `refactor-safely.md`    | Restructuring code without behavior changes                 |
| `analyze-bc3-sample.md` | Examining a new `.bc3` file and updating the knowledge base |

## Skills

### Project-specific (`.ai/skills/`)

| Skill                 | When to load                                                    |
| --------------------- | --------------------------------------------------------------- |
| `bc3-parser`          | Modifying tokenizer, parsers, builder, or domain assembler      |
| `bc3-corpus-analysis` | Analyzing BC3 sample files, cataloging record types             |
| `bc3-development`     | General code changes: adding types, domain models, architecture |

### Generic (`.agents/skills/`)

| Skill                       | Relevance                                                           |
| --------------------------- | ------------------------------------------------------------------- |
| `typescript-advanced-types` | Directly useful — generics, conditional types, discriminated unions |
| `nodejs-best-practices`     | Partially useful — module system, async patterns                    |
| `nodejs-backend-patterns`   | Not applicable                                                      |

## Parser Modification Workflow

When changing parser behavior:

1. Read `docs/bc3-knowledge/parser-behavior.md` for current state
2. Read `docs/bc3-knowledge/known-edge-cases.md` to avoid regressions
3. Create a fixture BC3 string that reproduces the target behavior
4. Document the edge case before implementing
5. Implement the change
6. Verify: `npm run ci` + fixture-based smoke test
7. Update `docs/bc3-knowledge/parser-behavior.md` if behavior changed

## Corpus Analysis Workflow

When analyzing a new BC3 file:

1. Follow `analyze-bc3-sample` playbook
2. Add file to `data/bc3-corpus/samples/real-world/` (read-only after placement)
3. Update `data/bc3-corpus/metadata/samples.index.json`
4. Update relevant knowledge base files
5. File is now reference — do not modify

## Verification

```bash
npm run ci            # build + format check
npm test              # run all tests (node:test + tsx)
npm run format        # auto-fix formatting
npm run dev:tokenize  # smoke test with scripts/file.bc3
```

## Key Documentation

| Topic                  | File                                          |
| ---------------------- | --------------------------------------------- |
| Parser behavior & gaps | `docs/bc3-knowledge/parser-behavior.md`       |
| Record type catalog    | `docs/bc3-knowledge/record-types.md`          |
| Known edge cases       | `docs/bc3-knowledge/known-edge-cases.md`      |
| Unsupported cases      | `docs/bc3-knowledge/unsupported-cases.md`     |
| Version differences    | `docs/bc3-knowledge/version-differences.md`   |
| Corpus metadata        | `data/bc3-corpus/metadata/samples.index.json` |
| BC3 grammar spec       | `docs/parser/grammar.md`                      |
| Record parsers         | `docs/parser/record-parsers.md`               |
| Parsing modes          | `docs/parser/parsing-modes.md`                |
| Module boundaries      | `docs/architecture/module-boundaries.md`      |
| Architecture overview  | `docs/architecture/overview.md`               |
| Domain model           | `docs/domain/model.md`                        |
| Development setup      | `docs/development/setup.md`                   |
| ADRs                   | `docs/decisions/index.md`                     |
