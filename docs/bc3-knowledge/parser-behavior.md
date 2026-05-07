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

| Gap                                                                                                                                        | Status             |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| **ISO-8859-1 encoding** — callers must decode Latin-1 before calling `BC3.parse()` (#100). Tokenizer operates on JS strings.               | Deferred to caller |
| **Multiline ~D records** — resolved: DParser handles ARQUIMEDES format. Null-byte stripping (#104) handles Excesos-Mod continuation lines. | Resolved           |
| **Null byte handling** — `stripNullBytes()` added (#104). NUL bytes removed before tokenizing.                                             | Resolved           |
| **Extremely long lines** — ~X records with 300+ parameter pairs and 27,598-char lines parse correctly. No hard limit observed.             | Working (untuned)  |
| **~K negative digit counts** — resolved: KParser stores subfields as raw strings (#98).                                                    | Resolved           |
| **~V empty vendor field** — all ~V fields are optional. TCQ files parse correctly.                                                         | Resolved           |
| **Backslash in version string** — VParser reconstructs version field and splits on last `\` for date suffix (#106).                        | Resolved           |

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
