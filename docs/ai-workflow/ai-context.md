# AI Context

BC3 parser project — a zero-dependency TypeScript library that parses FIEBDC-3 (BC3) construction database files.

## Project Identity

- **Package:** `bc3` v0.7.0
- **Purpose:** Parse `.bc3` files into a hierarchical domain model
- **Author:** Igor HC (ogorhc)
- **License:** MIT

## Technology Stack

- **Language:** TypeScript 5.9, strict mode, target ES2022
- **Module system:** ESM-native (`"type": "module"`), dual CJS/ESM output
- **Build:** tsup (bundles `src/index.ts` → `dist/`)
- **Formatting:** Prettier (80 width, single quotes, trailing commas)
- **Versioning:** Changesets
- **Runtime deps:** None (zero-dependency library)
- **Test framework:** `node:test` (built-in) + `tsx` loader — run with `npm test`; 83 tests across 3 files

## Architecture

### Pipeline

```
BC3.parse(input)
  → Tokenizer (~ record boundaries, | fields, \\ subfields)
    → RecordDispatcher (routes ~X → XParser)
      → 14 strategy parsers (~V through ~E + UnknownRecordParser)
        → BC3ParseStore (intermediate)
          → DomainAssembler → BC3Document (composite tree)
```

### Module boundaries (strict)

| Module       | May import from                             |
| ------------ | ------------------------------------------- |
| `api/`       | `importers/`, `domain/`                     |
| `importers/` | `parsing/`, `builder/`, `domain/`, `utils/` |
| `parsing/`   | `builder/`, `domain/`, `utils/`             |
| `builder/`   | `domain/`, `utils/`                         |
| `domain/`    | nothing                                     |
| `utils/`     | nothing                                     |

Domain must remain pure — no parsing, builder, or importer imports.

## Reference Corpus

BC3 files at `data/bc3-corpus/samples/real-world/` are **reference material** — never modify these files. They represent real-world FIEBDC-3 exports from Presto, ARQUIMEDES, and TCQ generators.

### Corpus inventory

| File                            | FIEBDC | Generator    | Records | Class     |
| ------------------------------- | ------ | ------------ | ------- | --------- |
| `19-026-...V02.bc3`             | 2016   | Presto 20.02 | 2,446   | edge      |
| `21-028-...V03.bc3`             | 2002   | Presto 10.22 | 1,537   | edge      |
| `250617_...Mod).bc3`            | 2002   | Presto 8.8   | ~2,855  | malformed |
| `250617_...v10.BC3`             | 2016   | TCQ 6.2      | 2,578   | valid     |
| `PRESUPUESTO...ZORROZAURRE.bc3` | 2002   | Presto 8.7   | 3,010   | valid     |
| `PRESUPUESTO-VQUISI.bc3`        | 2012   | ARQUIMEDES   | 2,439   | edge      |
| `TSL-DP-...RV02.bc3`            | 2020   | Presto 25.00 | 4,744   | valid     |

Metadata: `data/bc3-corpus/metadata/samples.index.json`

## Knowledge Base

- `docs/bc3-knowledge/record-types.md` — observed types, unsupported types
- `docs/bc3-knowledge/version-differences.md` — FIEBDC-3 evolution
- `docs/bc3-knowledge/known-edge-cases.md` — 9 documented edge cases
- `docs/bc3-knowledge/parser-behavior.md` — current parser capabilities and gaps
- `docs/bc3-knowledge/unsupported-cases.md` — ~O, ~G with priority strategy

## Project Rules

1. **BC3 files are reference corpus** — never modify files in `data/bc3-corpus/samples/`
2. **Do not modify parser behavior without fixture-based tests** — create BC3 string fixtures first
3. **Preserve unknown records when possible** — UnknownRecordParser must not discard content
4. **Document edge cases before changing parser logic** — update `docs/bc3-knowledge/known-edge-cases.md`
5. **Module boundaries are hard blocks** — never bypass the dependency rules in PRs
6. **ISO-8859-1 is the real-world encoding** — all corpus files use Latin-1

## Documentation Map

| Topic               | Primary doc                               |
| ------------------- | ----------------------------------------- |
| Build, format, CI   | `AGENTS.md`                               |
| Architecture & flow | `docs/architecture/overview.md`           |
| Module boundaries   | `docs/architecture/module-boundaries.md`  |
| BC3 grammar         | `docs/parser/grammar.md`                  |
| Record parsers      | `docs/parser/record-parsers.md`           |
| Parsing modes       | `docs/parser/parsing-modes.md`            |
| Domain model        | `docs/domain/model.md`                    |
| Release process     | `docs/development/release-process.md`     |
| Development setup   | `docs/development/setup.md`               |
| Decisions (ADRs)    | `docs/decisions/index.md`                 |
| Record types        | `docs/bc3-knowledge/record-types.md`      |
| Edge cases          | `docs/bc3-knowledge/known-edge-cases.md`  |
| Parser gaps         | `docs/bc3-knowledge/parser-behavior.md`   |
| Unsupported cases   | `docs/bc3-knowledge/unsupported-cases.md` |
| AI workflow         | `docs/ai-workflow/index.md`               |

## Repository Structure

```
src/                     # Library source
  api/                   # Public API (BC3.parse)
  importers/             # Source adapters
  parsing/               # Tokenizer + 14 record-type parsers
  builder/               # BC3ParseStore → DomainAssembler
  domain/                # Pure domain model
  utils/                 # Generic helpers

data/bc3-corpus/         # Reference BC3 samples (never modify)
  samples/real-world/    # 7 real BC3 files
  metadata/              # samples.index.json

docs/                    # Project documentation
  architecture/          # Pipeline, module-boundaries, design-patterns
  domain/                # Domain model reference
  parser/                # Grammar, parsing-modes, record-parsers
  development/           # Setup, release-process, roadmap
  decisions/             # Architectural Decision Records (ADRs)
  bc3-knowledge/         # Corpus analysis outputs
  ai-workflow/           # AI agent instructions

.ai/                     # AI infrastructure
  skills/                # Project-specific skills
  playbooks/             # Task playbooks

.agents/skills/          # Generic skills (autoskills)
```
