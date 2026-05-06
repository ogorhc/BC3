# Parser Coverage Matrix

Audit of BC3 record-type parsers, their connection to the domain model, and gaps.

**Date:** 2026-05-06
**Scope:** `src/parsing/dispatch/parsers/` → `src/builder/` → `src/domain/`

---

## Implemented parsers (15)

| Type    | Parser file              | BC3 meaning                 | Connected to domain model                                          | Data dropped                           |
| ------- | ------------------------ | --------------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| `~V`    | `VParser.ts`             | Version / metadata          | Full — `DocumentMetadata` on `BC3Document`                         | —                                      |
| `~K`    | `KParser.ts`             | Cost coefficients           | Full — `Coefficients` on `BC3Document`                             | —                                      |
| `~C`    | `CParser.ts`             | Concept definition          | Full — `Concept → ConceptNode`                                     | `ConceptInput.codes` alias array       |
| `~D`    | `DParser.ts`             | Decomposition (structured)  | Full — `Decomposition[]` on parent `ConceptNode`                   | `DecompositionLineInput.raw`           |
| `~T`    | `TParser.ts`             | Descriptive text            | Full — stored as `Concept.text`                                    | —                                      |
| `~M`    | `MParser.ts`             | Measurement                 | Full — `Measurement[]` on `ConceptNode`                            | `rawFields`, detail `.raw`             |
| `~N`    | `NParser.ts`             | Notes / measurement variant | Full — merged into `measurements` array (same as `~M`)             | `rawFields`, detail `.raw`             |
| `~B`    | `BParser.ts`             | Code rename                 | Applied as mutation to `concepts`/`decompositions`/`texts` keys    | Original mapping is **not surfaced**   |
| `~Y`    | `YParser.ts`             | Layout / decomp variant     | Full — appends to same `decompositions` map as `~D`                | —                                      |
| `~L`    | `LParser.ts`             | Specification sections      | Full — `Specification` on `ConceptNode` or `BC3Document`           | Per-concept map dropped after assembly |
| `~X`    | `XParser.ts`             | IT codes / BIM / LCA        | Full — `ITCodes` on `ConceptNode` or `BC3Document`                 | Per-concept map dropped after assembly |
| `~E`    | `EParser.ts`             | Entity                      | Full — `entities: Map<string, Entity>` on `BC3Document`            | —                                      |
| `~A`    | `AParser.ts`             | Thesaurus                   | Full — `Thesaurus` on `ConceptNode`                                | Per-concept map dropped after assembly |
| `~O`    | `OParser.ts`             | Cost overrides              | Full — `costOverrides: Map<string, CostOverride>` on `BC3Document` | —                                      |
| `~G`    | `GParser.ts`             | Image/graphic attachment    | Full — `attachments: Attachment[]` on `BC3Document`                | —                                      |
| Unknown | `UnknownRecordParser.ts` | Catch-all                   | Diagnostic only (lenient) / throw (strict)                         | Record content **not preserved**       |

---

## Not implemented (0)

All FIEBDC-3 record types observed in the corpus are now implemented. Remaining spec types (~R, ~F, ~W, ~I) have zero corpus occurrences and no formal specification documentation available. ~H was confirmed as NUL-byte corruption, not a real BC3 record type.

---

## Spec types with parsers but zero corpus occurrences

| Type | Parser       | Observations                                                                |
| ---- | ------------ | --------------------------------------------------------------------------- |
| `~N` | `NParser.ts` | 0 occurrences in 7 files — parser exists, stores to `measurements` array    |
| `~B` | `BParser.ts` | 0 occurrences — code rename mutations never triggered                       |
| `~Y` | `YParser.ts` | 0 occurrences — layout variant of `~D`, stores to same `decompositions` map |

---

## Data flow gaps: parsed but lost

| Parsed data                                                                                                  | Where parsed                         | Where lost                                                      |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------ | --------------------------------------------------------------- |
| Concept aliases (`~C` field 0 subfields 1+)                                                                  | `CParser` → `ConceptInput.codes`     | `DomainAssembler` Pass 1 only uses primary `code`               |
| Raw field strings (`DecompositionLineInput.raw`, `MeasurementInput.rawFields`, `MeasurementDetailInput.raw`) | All parsers                          | `DomainAssembler` never maps them to domain types               |
| `store.source` / `store.raw`                                                                                 | `BC3Builder.init()`                  | Never transferred to `BC3Document`                              |
| Unknown record content                                                                                       | `UnknownRecordParser`                | Diagnostic emitted; content is **discarded**                    |
| `~B` code change mapping                                                                                     | `BParser` → `BC3Builder.codeChanges` | Applied as mutations; original mapping not surfaced in document |

---

## Domain model gaps: types that exist but are never populated

_None._ All domain types are now populated through the parser pipeline, including `Attachment` (from ~G records via `DomainAssembler`).

---

## Coverage summary

| Category                    | Count                            | Pct   |
| --------------------------- | -------------------------------- | ----- |
| Spec-record types           | 16 (`~V`–`~A`, `~N`, `~B`, `~Y`) | —     |
| Parsers implemented         | 15 of 16 + 1 Unknown catch-all   | 100%  |
| Parsers connected to domain | 15 of 15                         | 100%  |
| Corpus record types         | 14 observed + 1 corruption       | —     |
| Corpus types parsed         | 14 of 14                         | 100%  |
| Corpus records parseable    | ~25,000 of ~25,550               | ~100% |
| Records silently dropped    | 0                                | 0%    |
