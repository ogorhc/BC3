# BC3 Knowledge Base

Domain knowledge about the FIEBDC-3 / BC3 file format, derived from corpus analysis and the FIEBDC-3 specification PDFs.

## Documents

| File                                               | Contents                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| [record-types.md](./record-types.md)               | Catalog of all record types (`~V`, `~C`, `~D`, …) with corpus occurrence counts |
| [known-edge-cases.md](./known-edge-cases.md)       | 9 documented edge cases found in real-world files                               |
| [parser-behavior.md](./parser-behavior.md)         | Current parser capabilities, gaps, and per-file status                          |
| [unsupported-cases.md](./unsupported-cases.md)     | `~O`, `~G`, `~H` — not yet implemented; implementation notes                    |
| [version-differences.md](./version-differences.md) | Differences between FIEBDC-3/2020 and FIEBDC-3/2024 (corpus-inferred)           |

## Corpus files

Real-world BC3 samples live in `data/bc3-corpus/samples/real-world/` and are **read-only**.
Structured metadata is in `data/bc3-corpus/metadata/samples.index.json`.

All 7 corpus files are ISO-8859-1 + CRLF encoded. If decoded as UTF-8, Spanish characters corrupt silently.

## Key findings from corpus analysis

| Finding                                                                   | Impact                                               |
| ------------------------------------------------------------------------- | ---------------------------------------------------- |
| ARQUIMEDES emits multi-line `~D` (continuation lines without `~`)         | 3,897 lines silently dropped in VQUISI — 62% of file |
| `Excesos-Mod` has NUL bytes (`\x00`) in every line                        | File cannot be parsed without preprocessing          |
| `~X` lines in TSL (Presto 25.00) up to 27,598 chars, 300+ BIM/LCA pairs   | Tokenizer handles it; domain model is minimal        |
| `~K` field 0 subfield 0 can be `-9` (negative)                            | Parser must tolerate                                 |
| `~N`, `~B`, `~Y` parsers exist but zero occurrences in all 7 corpus files | Untested against real data                           |
| `~O` appears 517 times across 3 files                                     | Not yet implemented — see `unsupported-cases.md`     |

## Specification PDFs

`docs/specifications/Formato-FIEBDC-3-2020.pdf` and `Formato-FIEBDC-3-2024.pdf` exist but are not machine-readable in this environment (`pdftotext` unavailable). The knowledge base is corpus-inferred.
