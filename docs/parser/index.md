# Parser

Documentation for BC3 tokenization, dispatch, and record-type parsers.

## Documents

| File                                     | Contents                                                        |
| ---------------------------------------- | --------------------------------------------------------------- |
| [grammar.md](./grammar.md)               | BC3 file format grammar — record, field, subfield rules         |
| [parsing-modes.md](./parsing-modes.md)   | Strict vs lenient mode behaviour                                |
| [record-parsers.md](./record-parsers.md) | Per-type parser reference: fields consumed, diagnostics emitted |

## Quick reference

```
Input string
  → Tokenizer             splits into RawRecord[] (type, fields: string[][], raw, index)
    → RecordDispatcher    looks up parser by record.type
      → XParser.parse()   calls ctx.builder.onX(payload)
        ↑ unknown type:   strict → throw; lenient → warn diagnostic + skip
```

### Record types implemented

| Type    | Parser              | BC3 meaning                      | Corpus occurrences |
| ------- | ------------------- | -------------------------------- | ------------------ |
| `~V`    | VParser             | Version / metadata               | All files          |
| `~K`    | KParser             | Cost coefficients                | Most files         |
| `~C`    | CParser             | Concept definition               | All files          |
| `~D`    | DParser             | Decomposition (structured)       | Most files         |
| `~T`    | TParser             | Descriptive text for concept     | Common             |
| `~M`    | MParser             | Measurement                      | Common             |
| `~N`    | NParser             | Notes / measurement variant      | Rare               |
| `~B`    | BParser             | Bibliographic / code rename      | Rare               |
| `~Y`    | YParser             | Layout / decomposition variant   | Rare               |
| `~L`    | LParser             | Specification (pliegos) sections | Rare               |
| `~X`    | XParser             | IT codes / BIM / LCA parameters  | Rare (large)       |
| `~E`    | EParser             | Entities (vendors, authors)      | Rare               |
| `~A`    | AParser             | Thesaurus                        | Rare               |
| Unknown | UnknownRecordParser | —                                | —                  |

### Not yet implemented

`~O` (cost override), `~G` — see `docs/bc3-knowledge/unsupported-cases.md`.
