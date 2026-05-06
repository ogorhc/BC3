# BC3 Corpus Analysis

Analyze and classify FIEBDC-3 / BC3 files to extract parser knowledge. The corpus at `data/bc3-corpus/samples/` is reference material — files placed here are read-only.

## When to Use

- Examining a new `.bc3` sample file
- Cataloging real-world BC3 variants
- Discovering unsupported record types
- Identifying edge cases and malformed content
- Extracting encoding, decimal format, and dialect information

## Critical Rules

### BC3 files are reference corpus

Files placed in `data/bc3-corpus/samples/real-world/` are reference material. **Never modify these files.** Analysis is read-only. Tests use string fixtures, not modified corpus files.

### Preserve unknown records

When discovering unsupported record types, document them immediately in `docs/bc3-knowledge/unsupported-cases.md`. The strategy is to capture and preserve, not discard.

### Document edge cases before changing parser logic

Every edge case found during analysis must be documented in `docs/bc3-knowledge/known-edge-cases.md` before any parser change addresses it.

## Analysis Steps

### 1. File Inspection

```bash
file <path>                     # MIME type / encoding
wc -l <path>; wc -c <path>      # line count, byte size
file -bi <path>                 # charset
hexdump -C <path> | head -20    # BOM, binary content, line endings
```

### 2. Record Type Inventory

```bash
cat <path> | LC_ALL=C grep -oP '^~[A-Za-z]' | sort | uniq -c | sort -rn
```

Also count non-tilde lines (potential multiline records or garbage):

```bash
total=$(wc -l < <path>); tilde=$(grep -c '^~' <path>); echo "$((total - tilde)) continuation lines"
```

### 3. Structure Inspection

- ~V header: generator, FIEBDC version, encoding, extra fields
- First/last 5 lines
- Check for `~~` start-of-file marker (BC3-2020+, rarely used)
- Check separator consistency (`|` for fields, `\\` for subfields)
- Check line ending consistency (`\r\n` vs `\n`)

### 4. Content Spot-Checks

- ~C records: code hierarchy patterns (`#` suffix), concept types
- ~D records: single-line vs multiline, percentage nodes, factor/quantity pairs
- ~T and ~M: text and measurement formats
- ~X records: IT code format, BIM/LCA metadata
- ~O records: location-based price overrides

### 5. Edge Case Detection

Check for each known edge case category:

- Multiline records (line count > tilde count)
- Null bytes (`grep -c $'\x00' <path>`)
- Negative digit counts in ~K
- Empty vendor field in ~V
- Non-standard decimal separator (comma)
- Unknown record types

### 6. Classify

| Category    | Criteria                                                             |
| ----------- | -------------------------------------------------------------------- |
| `valid`     | Well-formed, standard separators, all types recognized               |
| `edge-case` | Valid BC3 but with dialect-specific conventions or unsupported types |
| `malformed` | Syntax errors, corrupt content, null byte contamination              |

### 7. Record Findings

**Always update these files after analysis:**

1. `data/bc3-corpus/metadata/samples.index.json` — add sample entry
2. `docs/bc3-knowledge/record-types.md` — update occurrence matrix
3. `docs/bc3-knowledge/known-edge-cases.md` — document new edge cases
4. `docs/bc3-knowledge/parser-behavior.md` — note behavioral implications
5. `docs/bc3-knowledge/unsupported-cases.md` — catalog any new unsupported types
6. `docs/ai-workflow/current-handover.md` — summarize findings

## Output Artifacts

| File                                          | Purpose                                |
| --------------------------------------------- | -------------------------------------- |
| `data/bc3-corpus/metadata/samples.index.json` | Structured metadata per sample         |
| `docs/bc3-knowledge/record-types.md`          | Catalog of observed record types       |
| `docs/bc3-knowledge/known-edge-cases.md`      | Edge cases found in corpus             |
| `docs/bc3-knowledge/parser-behavior.md`       | Behavioral implications for the parser |
| `docs/bc3-knowledge/unsupported-cases.md`     | Types not yet handled by parser        |
| `docs/bc3-knowledge/version-differences.md`   | FIEBDC version evolution               |

## Related Skills

- `bc3-parser` — for implementing parser changes based on corpus analysis findings
