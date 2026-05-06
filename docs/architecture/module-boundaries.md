# Module Boundaries

This document defines the **module boundaries and folder structure** of the BC3 project. The goal is to ensure a clear separation of concerns between **API**, **importers**, **parsing**, **domain**, and **construction**, while keeping the system extensible and maintainable.

---

## 1. Core principles

- The **domain model** must be independent from parsing, import, and IO logic
- Parsing is an implementation detail of a specific importer
- The **Builder** is the single writer of the domain model
- The **API** is a thin façade and must not contain business logic
- Utilities must remain dependency-free

---

## 2. High-level architecture

BC3 follows a layered flow:

```text
API
 ↓
Importer (source-specific)
 ↓
Tokenizer → Dispatcher → Strategy
 ↓
Builder
 ↓
Composite Domain Model (BC3Document)
```

Each layer has a single responsibility and communicates only downward.

---

## 3. Importers layer

### Purpose

The **importers** layer adapts different data sources into operations executed by the Builder.

An importer:

- Owns the import workflow for a specific source
- Coordinates parsing, validation, and construction
- Produces a `BC3Document`

### Initial importer (project focus)

The initial and only importer in the first phase of the project is:

- **BC3 text importer (FIEBDC-3)**

This importer:

- Accepts a `.bc3` text input
- Uses the tokenizer, dispatcher, and parsing strategies
- Delegates all model creation to the Builder

Future importers may include:

- XML-based formats
- Relational databases (e.g. PostgreSQL)
- Programmatic/UI-driven construction

---

## 4. Actual folder structure

> The implemented structure differs from the original design spec. This reflects the real codebase as of v0.7.0.

```text
src/
  index.ts                    # Barrel export

  api/
    BC3.ts                    # Public façade: BC3.parse()
    types/PublicApi.ts        # ParseOptions, ParseResult

  importers/
    StringImporter.ts         # Adapts string input for parsing
    types/

  parsing/
    Tokenizer.ts              # Record/field/subfield tokenization
    parseBC3.ts               # Orchestration: tokenize + dispatch + assemble
    dispatch/
      RecordDispatcher.ts     # Routes records to strategy parsers
      parsers/
        VParser.ts ... AParser.ts   # 13 record-type parsers
        UnknownRecordParser.ts      # Fallback
        createDefaultParsers.ts     # Registry factory
      types/
        ParseContext.ts       # { options, diagnostics, builder }
        RecordParser.ts       # interface: parse(record, ctx): void
    types/
      RawRecord.ts            # { type, index, raw, fields: string[][] }

  builder/
    BC3Builder.ts             # Builder: onV(), onC(), onD(), ...
    BC3ParseStore.ts          # Intermediate store
    assemblers/
      DomainAssembler.ts      # store → BC3Document

  domain/
    BC3Document.ts            # Root aggregate
    ConceptNode.ts            # Composite tree node
    Decomposition.ts, Measurement.ts, Attachment.ts, Entity.ts ...
    types/                    # Concept, Diagnostic, Money, Units, ...

  utils/
    strings.ts
```

---

## 5. Module responsibilities

- **api/**: stable public surface; selects the appropriate importer
- **importers/**: source-specific workflows that adapt inputs to Builder operations
- **domain/**: pure domain entities and invariants
- **parsing/**: tokenizer, dispatcher, strategies, and parsing context
- **builder/**: domain assembly and hierarchy construction
- **utils/**: generic helpers with no domain dependency

---

## 6. Dependency rules

Allowed dependencies:

- `api` → `importers`, `domain`
- `importers` → `parsing`, `builder`, `domain`, `utils`
- `parsing` → `builder`, `domain`, `utils`
- `builder` → `domain`, `utils`
- `domain` → (none)
- `utils` → (none)

Disallowed dependencies:

- `domain` importing `parsing`, `builder`, or `importers`
- `utils` importing `domain`
- `parsing` importing `api`

---

## 7. Notes

- Parsing strategies are internal to the BC3 text importer
- The architecture supports incremental implementation by record type
- Additional importers can be added without modifying the domain or API
