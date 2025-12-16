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

## 4. Proposed folder structure

```text
src/
  index.ts

  api/
    bc3.ts              # Public API façade (BC3.parse, BC3.from)
    types.ts            # Public options and return types

  importers/
    bc3-text/
      importer.ts       # BC3 text import orchestration
      options.ts        # Importer-specific options

  domain/
    document.ts         # BC3Document aggregate
    concept.ts          # Concept entity + hierarchy node
    decomposition.ts    # Decomposition entities
    measurement.ts      # Measurement entities
    attachments.ts      # Attachments / resources
    diagnostics.ts      # Diagnostics model

  parsing/
    tokenizer/
      tokenizer.ts      # Record and field tokenization
      tokens.ts         # Token definitions

    dispatcher/
      dispatcher.ts     # Strategy selection
      registry.ts       # Strategy registration

    strategies/
      v.parser.ts       # ~V
      k.parser.ts       # ~K
      c.parser.ts       # ~C
      d.parser.ts       # ~D
      m.parser.ts       # ~M

    context/
      parse-context.ts  # Shared parsing state

  builder/
    builder.ts          # Domain construction orchestrator
    hierarchy.ts        # Composite hierarchy helpers
    resolvers.ts        # Deferred reference resolution

  utils/
    strings.ts
    numbers.ts
    dates.ts
    charset.ts
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
