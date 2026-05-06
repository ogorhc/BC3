# Parser Behavior

How the current parser (`src/`) processes BC3 input, what it handles, and where it would fail on real-world corpus data.

## Current processing pipeline

```
Input string
  → Tokenizer (record boundaries via ~, field split via |, subfield split via \)
    → RecordDispatcher (routes ~X to XParser)
      → Strategy parsers (14 record-type parsers)
        → BC3ParseStore (intermediate store)
          → DomainAssembler → BC3Document
```

## Tokenizer behavior

- **Record delimiter:** `~` at start of line. Records end at next `~` or EOF.
- **Field separator:** `|` (pipe). Consecutive `||` = empty field.
- **Subfield separator:** `\\` (double backslash). Single `\` treated literally.
- **Whitespace:** Leading/trailing whitespace trimmed per field/subfield. Internal whitespace preserved.
- **Line endings:** `\n`, `\r\n`, and mixed line endings all accepted.
- **EOF marker:** `\x1a` (Ctrl+Z) stripped if present at end of file.

## What the parser handles correctly

| Feature                                                        | Status                                          |
| -------------------------------------------------------------- | ----------------------------------------------- |
| Standard record types (~V ~K ~C ~D ~T ~M ~N ~B ~Y ~L ~X ~E ~A) | Supported                                       |
| Unknown record types (via UnknownRecordParser)                 | Supported in lenient mode, error in strict mode |
| Empty fields and subfields                                     | Supported                                       |
| Mixed line endings (\n, \r\n)                                  | Supported                                       |
| Backslash in values (single `\`)                               | Supported (literal, not subfield separator)     |
| Double backslash (`\\`) as subfield separator                  | Supported                                       |
| Leading/trailing whitespace trimming                           | Supported                                       |
| `'lenient'` mode (collect diagnostics, continue)               | Supported                                       |
| `'strict'` mode (fail on first error)                          | Supported                                       |
| Ctrl+Z EOF marker                                              | Supported                                       |

## Gaps vs real-world corpus

| Gap                                                                                                                                                                                | Impact on corpus files                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **ISO-8859-1 encoding** — tokenizer operates on raw strings; if passed a UTF-8 decoded string from an ISO-8859-1 file, Spanish characters (á, é, í, ó, ú, ñ, °, €) will be garbled | Affects all 7 files                                                                |
| **Multiline ~D records** — tokenizer uses `~` as record boundary; continuation lines without `~` prefix are dropped or mis-associated                                              | Affects VQUISI (3,897 continuation lines), Excesos-Mod (34,858 continuation lines) |
| **Null byte handling** — stripNullBytes() added (#104); NUL bytes removed before tokenizing                                                                                        | Affected Excesos-Mod (now resolved)                                                |
| **Extremely long lines** — no known hard limit but ~X records with 300+ parameter pairs and 27,598-char lines may stress memory                                                    | Affects TSL                                                                        |
| **~K negative digit counts** — parser likely expects unsigned integers for `-9`                                                                                                    | Affects VQUISI                                                                     |
| **~V empty vendor field** — if parser assumes non-empty field 1, TCQ files would fail                                                                                              | Affects 250617_Mod                                                                 |
| **Backslash in version string** — VParser reconstructs version field and splits on last `\` for date suffix (fixed #106)                                                           | Affected TSL, 250617_Mod (now resolved)                                            |

## Parsing modes behavior

| Mode                  | Unknown record    | Missing field         | Invalid value         | File-level error      |
| --------------------- | ----------------- | --------------------- | --------------------- | --------------------- |
| `'lenient'` (default) | Diagnostic + skip | Diagnostic + continue | Diagnostic + continue | Diagnostic + continue |
| `'strict'`            | Throw error       | Throw error           | Throw error           | Throw error           |

## Diagnostics

Diagnostics are collected as `Diagnostic` objects with:

- `code`: error code
- `message`: human-readable description
- `record_index`: position in file
- `severity`: `'error'` | `'warning'` | `'info'`

Unknown records produce diagnostics in both modes but only throw in strict mode.
