# Domain Model

Documentation for the pure domain model — entities, relationships, and navigation patterns.

## Documents

| File                   | Contents                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------- |
| [model.md](./model.md) | Entity reference: BC3Document, ConceptNode, Decomposition, Measurement, Attachment |

## Key principle

The domain layer has **no dependencies** on parsing, builder, or importers. It is pure TypeScript. Parsing populates it through the `BC3Builder`; consumers read it as read-only data.

## Entity map

```
BC3Document (root aggregate)
  ├─ metadata: DocumentMetadata          ← from ~V
  ├─ roots: ConceptNode[]                ← top-level concepts with no parent
  ├─ conceptsByCode: Map<string, ConceptNode>   ← all concepts, keyed by normalized code
  ├─ attachments: Attachment[]           ← global attachments
  ├─ entities: Map<string, Entity>       ← from ~E
  ├─ specificationsDictionary?: Specification   ← from ~L
  ├─ itCodesDictionary?: ITCodes         ← from ~X (global)
  └─ diagnostics: Diagnostic[]

ConceptNode
  ├─ concept: Concept                    ← value object: code, unit, summary, prices, dates
  ├─ children: ConceptNode[]             ← composite children
  ├─ decompositions: Decomposition[]     ← from ~D
  ├─ measurements: Measurement[]         ← from ~M
  ├─ attachments: Attachment[]           ← per-concept attachments
  ├─ specification?: Specification       ← from ~L
  ├─ itCodes?: ITCodes                   ← from ~X (per-concept)
  └─ thesaurus?: Thesaurus               ← from ~A
```

## Source files

All domain types live in `src/domain/`:

| File                  | Type(s)                            |
| --------------------- | ---------------------------------- |
| `BC3Document.ts`      | `BC3Document`, `DocumentMetadata`  |
| `ConceptNode.ts`      | `ConceptNode`                      |
| `types/Concept.ts`    | `Concept`, `ConceptType`           |
| `Decomposition.ts`    | `Decomposition`                    |
| `Measurement.ts`      | `Measurement`, `MeasurementDetail` |
| `Attachment.ts`       | `Attachment`                       |
| `Entity.ts`           | `Entity`                           |
| `Specification.ts`    | `Specification`                    |
| `ITCode.ts`           | `ITCodes`                          |
| `Thesaurus.ts`        | `Thesaurus`                        |
| `types/Diagnostic.ts` | `Diagnostic`                       |
| `types/Money.ts`      | `Money`                            |
| `types/Units.ts`      | units helpers                      |
