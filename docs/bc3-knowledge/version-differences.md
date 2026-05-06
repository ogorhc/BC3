# FIEBDC-3 Version Differences

Inferred from real-world corpus and specification documentation (2020 and 2024 PDFs available in `docs/specifications/`).

## Version timeline

| Version       | Year  | ~V header example                                                                | Notable changes                                                                                                                                                                                                                                                                                |
| ------------- | ----- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIEBDC-3/2002 | ~2002 | `~V\|SOFT S.A.\|FIEBDC-3/2002\|Presto 8.7\|\|ANSI\|`                             | Baseline format. 13 record types defined.                                                                                                                                                                                                                                                      |
| FIEBDC-3/2012 | ~2012 | `~V\|CYPE INGENIEROS, S.A.\|FIEBDC-3/2012\|ARQUIMEDES\|\|ANSI\|Presupuesto\|2\|` | Added concept type code field in ~K. Multiline ~D records observed (ARQUIMEDES generator).                                                                                                                                                                                                     |
| FIEBDC-3/2016 | ~2016 | `~V\|RIB Spain\|FIEBDC-3/2016\|Presto 20.02\|\|ANSI\|\|2\|\|\|\|`                | Expanded ~V header (3 extra pipe-delimited fields: `\|2\|\|\|\|`). Added `\version_date` subfield to version string.                                                                                                                                                                           |
| FIEBDC-3/2020 | ~2020 | `~V\|RIB Spain\|FIEBDC-3/2020\02102025\|Presto 25.00\|\|ANSI\|\|2\|\|\|\|`       | Introduced `~~` start-of-file marker (spec, not observed). Expanded ~X records with BIM metadata and environmental LCA parameters. **Environmental impact fields:** GWP-total, ADPE, ADPF, AP, EP-fresh, EP-marine, EP-terrestrial, ODP, POCP, WP, HWD, MFR, FW as structured key-value pairs. |
| FIEBDC-3/2024 | 2024  | _Not observed in corpus_                                                         | Specification PDF available (`docs/specifications/Formato-FIEBDC-3-2024.pdf`, 97 pages). Likely expands environmental LCA decomposition (GWP-biogenic, GWP-fossil, GWP-luluc sub-indicators observed in 2020-generated Presto 25.00 files — suggesting forward-looking implementation).        |

## Observed version string variants

The version string in ~V records has two formats:

```
Format A: FIEBDC-3/2002          (version only)
Format B: FIEBDC-3/2020\02102025  (version\date in YYMMDDHHMM?)
```

The `\` in format B is a backslash — the same character used as subfield separator elsewhere in BC3. This creates parsing ambiguity: a naive split on `\` would break the version field into subfields.

## ~X record evolution across versions

| FIEBDC version | Generator      | ~X format                             | Content                                                                                                                  |
| -------------- | -------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 2002–2012      | Presto ≤ 10.22 | `~X\|\|code\desc\unit\...\|`          | IT code classification dictionary (global, not per-concept)                                                              |
| 2016           | Presto 20.02   | `~X\|concept\|code\desc\unit\...\|`   | Per-concept dictionary with basic fields (ce, m, v, ler, eCO2)                                                           |
| 2020           | Presto 25.00   | `~X\|concept\|param\value\unit\...\|` | Per-concept BIM metadata (hundreds of Revit parameters) + full LCA environmental decomposition (GWP, ADPE, AP, EP, etc.) |

The TSL file (Presto 25.00, 2020 spec) contains ~X records with approximately 300+ parameter pairs per concept, including:

- GWP-total, GWP-biogenic, GWP-fossil, GWP-luluc (global warming sub-indicators)
- ADPE, ADPF (abiotic depletion)
- AP (acidification)
- EP-fresh, EP-marine, EP-terrestrial (eutrophication)
- ODP (ozone depletion)
- POCP (photochemical ozone creation)
- WP (water pollution)
- HWD (hazardous waste disposed)
- MFR (materials for recycling)
- FW (freshwater use)

These sub-indicator breakdowns (A1–A5, B2, C1–C4, D lifecycle stages) suggest the 2024 specification may formalize what Presto 25.00 already emits under the 2020 specification.

## `~~` start-of-file marker

The 2020 specification introduced `~~` (double tilde) as an optional start-of-file marker. **No file in the real-world corpus uses this marker.** All 7 files begin directly with `~V|...`.

## Uncertainties

- The difference between 2020 and 2024 specifications cannot be fully verified without extracted text from the PDFs. The observations above are inferred from the corpus.
- `~N`, `~B`, `~Y` are documented in the 2002 spec but have zero real-world occurrences — they may be deprecated or generator-specific.
- The version date subfield format (`\02102025`) is assumed to be `MMDDYYYY` or `DDMMYYYY` but this is unconfirmed.
