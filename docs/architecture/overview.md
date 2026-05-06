# Architecture Overview

## Purpose

`bc3` parses FIEBDC-3 (BC3) construction-database files and produces a strongly-typed hierarchical in-memory model (`BC3Document`).

## Pipeline (actual implementation)

```
BC3.parse(input, options?)          ← public API façade
  └─ StringImporter                 ← adapts string source
       └─ parseBC3Internal()
            ├─ Tokenizer            ← splits raw text into RawRecord[]
            ├─ RecordDispatcher     ← routes each record to the right parser
            │    └─ XParser (×14)  ← one strategy per record type + UnknownRecordParser
            │         └─ BC3Builder.onX() ← populates BC3ParseStore
            └─ DomainAssembler      ← converts store → BC3Document
```

## Real source tree

```
src/
  index.ts                  ← barrel export (public surface)

  api/
    BC3.ts                  ← BC3.parse() façade
    types/PublicApi.ts      ← ParseOptions, ParseResult, ParseModel

  importers/
    StringImporter.ts       ← adapts a raw string for parsing
    types/

  parsing/
    Tokenizer.ts            ← record/field/subfield tokenization
    parseBC3.ts             ← orchestrates tokenize + dispatch + assemble
    dispatch/
      RecordDispatcher.ts   ← routes RawRecord → RecordParser
      parsers/
        VParser.ts          ← ~V (version/metadata)
        KParser.ts          ← ~K (coefficients)
        CParser.ts          ← ~C (concept)
        DParser.ts          ← ~D (decomposition)
        TParser.ts          ← ~T (text)
        MParser.ts          ← ~M (measurement)
        NParser.ts          ← ~N (notes)
        BParser.ts          ← ~B (bibliographic)
        YParser.ts          ← ~Y (layout)
        LParser.ts          ← ~L (specification sections)
        XParser.ts          ← ~X (IT codes / BIM / LCA)
        EParser.ts          ← ~E (entities)
        AParser.ts          ← ~A (thesaurus)
        UnknownRecordParser.ts  ← fallback for unregistered types
        createDefaultParsers.ts ← registry factory
      types/
        ParseContext.ts     ← shared state: options, diagnostics, builder
        RecordParser.ts     ← interface: { type: string; parse(record, ctx): void }
    types/
      RawRecord.ts          ← { type, index, raw, fields: string[][] }

  builder/
    BC3Builder.ts           ← onV(), onC(), onD(), ... methods
    BC3ParseStore.ts        ← intermediate data store
    assemblers/
      DomainAssembler.ts    ← store → BC3Document

  domain/
    BC3Document.ts          ← root aggregate (read-only)
    ConceptNode.ts          ← composite tree node
    Decomposition.ts
    Measurement.ts
    Attachment.ts
    Entity.ts
    Specification.ts
    Thesaurus.ts
    ITCode.ts
    types/                  ← Concept, Diagnostic, Money, Units, ...

  utils/
    strings.ts              ← string helpers
```

## Design patterns

| Pattern   | Where applied               | Purpose                                                                            |
| --------- | --------------------------- | ---------------------------------------------------------------------------------- |
| Strategy  | `parsing/dispatch/parsers/` | One parser class per record type — add types without modifying existing parsers    |
| Builder   | `builder/`                  | Single writer of the domain model; parsers call `ctx.builder.onX()`                |
| Composite | `domain/ConceptNode.ts`     | Chapters, subchapters, and items are uniform `ConceptNode` instances with children |
| Façade    | `api/BC3.ts`                | `BC3.parse()` hides importer/parsing/builder internals                             |

See [design-patterns.md](./design-patterns.md) for detailed explanation.

## Key types

| Type                     | File                                             | Role                                                        |
| ------------------------ | ------------------------------------------------ | ----------------------------------------------------------- |
| `BC3.parse(input, opts)` | `api/BC3.ts`                                     | Only public entry point                                     |
| `ParseResult`            | `api/types/PublicApi.ts`                         | `{ document?, diagnostics[] }`                              |
| `RawRecord`              | `parsing/types/RawRecord.ts`                     | `{ type, index, raw, fields: string[][] }`                  |
| `ParseContext`           | `parsing/dispatch/types/ParseContext.ts`         | `{ options, diagnostics, builder }`                         |
| `RecordParser`           | `parsing/dispatch/parsers/types/RecordParser.ts` | `{ type: string; parse(r, ctx): void }`                     |
| `BC3Document`            | `domain/BC3Document.ts`                          | Root aggregate — read-only after assembly                   |
| `ConceptNode`            | `domain/ConceptNode.ts`                          | Composite node with `concept`, `children`, `decompositions` |

## Module dependency rules

See [module-boundaries.md](./module-boundaries.md).

## What does NOT exist yet

- `BC3.parseAsync()` — aspirational only, not implemented
- `charset` option on `BC3.parse()` — not implemented; callers must decode ISO-8859-1 before passing a string
- `collectRawRecords` option — not implemented
- `stats` in `ParseResult` — not implemented
- `BC3.from()` generic source factory — not implemented
- Streaming / partial parsing — not implemented
- `~O`, `~G`, `~H` parsers — not implemented (see `docs/bc3-knowledge/unsupported-cases.md`)
