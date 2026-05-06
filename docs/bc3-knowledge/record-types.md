# BC3 Record Types

Catalog of FIEBDC-3 record types observed in the real-world corpus, cross-referenced with the FIEBDC-3 specification and current parser support.

## Canonical types (per FIEBDC-3 specification)

| Code | Name                   | Description                                                             |
| ---- | ---------------------- | ----------------------------------------------------------------------- |
| `~V` | Version                | File header: vendor, format version, generator, encoding                |
| `~K` | Coefficients           | Currency, rounding rules, column visibility flags                       |
| `~C` | Concept                | Budget line item: code, unit, description, price, date, type            |
| `~D` | Decomposition          | Parent-child relationships: concept → subconcept (code)\factor\quantity |
| `~T` | Text                   | Text fields: concept code → description text                            |
| `~M` | Measurement            | Measurement data per concept: dimensions, BIM IDs, labels               |
| `~N` | Notes                  | Supplementary notes                                                     |
| `~B` | Bibliographic          | Bibliographic references                                                |
| `~Y` | Layout                 | Layout/display configuration                                            |
| `~L` | Specification sections | Specification hierarchy (section → subsection tree)                     |
| `~X` | IT codes               | Dictionary of <code>\description\units pairs (IT code database)         |
| `~E` | Entities               | External entities (companies, persons)                                  |
| `~A` | Thesaurus              | Keywords per concept for search/classification                          |

## Corpus occurrence matrix

| Type | 19-026 | 21-028 | Excesos-Mod\* | ZORROZAURRE | VQUISI | TSL   | 250617_Mod |
| ---- | ------ | ------ | ------------- | ----------- | ------ | ----- | ---------- |
| `~V` | 1      | 1      | 1             | 1           | 1      | 1     | 1          |
| `~K` | 1      | 1      | 1             | 1           | 1      | 1     | 1          |
| `~L` | 4      | —      | —             | —           | —      | 1     | —          |
| `~X` | 1      | —      | —             | —           | —      | 701   | —          |
| `~C` | 689    | 443    | 893           | 973         | 1,169  | 1,239 | 894        |
| `~D` | 316    | 206    | 331           | 405         | 269    | 637   | 331        |
| `~T` | 625    | 442    | 337           | 781         | 601    | 1,038 | 846        |
| `~M` | 304    | 185    | 387           | 770         | 284    | 1,003 | 505        |
| `~N` | —      | —      | —             | —           | —      | —     | —          |
| `~B` | —      | —      | —             | —           | —      | —     | —          |
| `~Y` | —      | —      | —             | —           | —      | —     | —          |
| `~E` | 22     | —      | 15            | —           | —      | 6     | —          |
| `~A` | 186    | 53     | 441           | 79          | 114    | 117   | —          |

`—` = not present in this file. `*` Excesos-Mod: null byte contamination, counts are approximate.

## Unsupported types (not in current parser)

| Type | Observed in                 | Occurrences | Inferred purpose                                                                        |
| ---- | --------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `~O` | 19-026, 21-028, Excesos-Mod | 517 total   | Observations / geographic cost overrides: `~O\|concept\location\price\location\price\|` |
| `~G` | 19-026                      | 1           | Image/graphic attachment: `~G\|concept\|filename.ext\|`                                 |
| `~H` | Excesos-Mod                 | 1           | Unknown — single occurrence in malformed file                                           |

## Spec types absent from corpus

`~N`, `~B`, and `~Y` are defined in the specification but have zero occurrences across 7 real-world files covering ~25,000 records. These appear to be rarely or never emitted by Presto, ARQUIMEDES, and TCQ generators.

## ~X record variants

~X records serve as key-value dictionaries but their content varies significantly by generator:

- **Standard IT codes** (Presto ≤ 10.x): `~X||code\description\unit\code\description\unit\|` — construction element classification codes
- **BIM metadata** (Presto ≥ 20.x, 2020 spec): `~X|concept_code|parameter_name\value\unit\parameter_name\value\unit\|` — per-concept BIM property export from Revit
- **Environmental LCA data** (Presto 25.00): `~X|concept_code|GWP-total\value\kg CO2eq\ADPE_A1\value\...\|` — life cycle assessment parameters per EN 15804

The TSL file has lines up to 27,598 characters in ~X records containing hundreds of BIM/LCA parameter pairs per concept.

## ~D record structure variants

Two observed formats:

1. **Single-line** (standard): `~D|parent_code|child1\factor1\qty1\child2\factor2\qty2\||`
2. **Multi-line** (ARQUIMEDES): Decomposition children split across multiple continuation lines:
   ```
   ~D|parent_code|
   |child1\\factor1\qty1
   \child2\\factor2\qty2
   \||
   ```
   Found in PRESUPUESTO-VQUISI.bc3.

## Encoding note

All corpus files use **ISO-8859-1** (Latin-1) encoding with CRLF line endings. No files use UTF-8 or UTF-16. The parser must handle ISO-8859-1 to read real-world Spanish construction data.
