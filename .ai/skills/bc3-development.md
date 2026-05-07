# BC3 Development

Project-specific development guidance for the bc3 parsing library.

## When to Use

Use this skill when extending the parser, adding new record types, modifying the domain model, or working with the builder/assembler pipeline.

## Parser Architecture

The parsing flow is:

```
Tokenized record (~X|fields|...)
  → RecordDispatcher (routes by record type)
    → Strategy parser (per-record-type: ~V, ~C, ~D, etc.)
      → Populates BC3ParseStore
        → DomainAssembler → BC3Document
```

### Adding a new record type

1. Add the parser class in `src/parsing/dispatch/parsers/` (e.g., `QParser.ts`)
2. Register it in `src/parsing/dispatch/parsers/createDefaultParsers.ts`
3. Add its type to `src/parsing/dispatch/types/Parsers.ts`
4. Extend `BC3ParseStoreData` in `src/builder/types/BC3ParseStoreData.ts` if new storage is needed
5. Extend `DomainAssembler` in `src/builder/assemblers/DomainAssembler.ts` to map store data to domain objects

### Parser interface

All parsers implement `RecordParser` from `src/parsing/dispatch/types/RecordParser.ts`. Each parser receives a `RawRecord` and `ParseContext` and returns a parse result.

### Parsing modes

- `'lenient'` (default): collects `Diagnostic` objects, continues on errors
- `'strict'`: throws on first error

## Domain Model

- `BC3Document` — root aggregate, provides tree navigation
- `ConceptNode` — composite pattern node with parent/children/ancestors
- `Decomposition` — economic parent-child relationships
- `Measurement` — measurement data with `MeasurementDetail`
- Other domain types are in `src/domain/`

Domain types must NOT import from `parsing/`, `builder/`, or `importers/`.

## Builder Pipeline

- `BC3ParseStore` — intermediate store between parsing and domain assembly
- `BC3Builder` — incremental document builder wrapper
- `DomainAssembler` — converts the parse store into the final `BC3Document`

## Code Conventions

- TypeScript strict mode; do not relax `noUncheckedIndexedAccess` or `noImplicitOverride`
- Prettier: single quotes, trailing commas, 80 print width
- No comments unless the logic is non-obvious
- Follow existing patterns in neighboring files
- Public API types go through `src/api/types/PublicApi.ts`
