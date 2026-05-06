# Unsupported Cases

Record types and structural patterns found in the real-world corpus that the current parser does not handle. This document drives parser extension priorities.

## Unsupported record types

### ~O — Observations / Geographic Cost Overrides

**Occurrences:** 517 across 3 files (19-026: 296, 21-028: 206, Excesos-Mod: 15)

**Format:**

```
~O|concept_code|location\price\location\price\...|
```

**Example:**

```
~O|01#|Alicante\288293.19\Andalucía\286082.96\Aragón\290709.78|
```

**Semantics:** Provides location-specific cost adjustments for a concept. Each pair is `location_name\price`. Used for regionalized budgeting where labor/material costs vary by autonomous community in Spain.

**Priority:** High — 517 records is significant.

**Implementation notes:**

- Domain type needed: `CostOverride` with concept code + array of `{ location: string, price: number }` pairs
- Parser: split the value field on `\`, validate even number of sub-elements
- Builder: store in BC3ParseStore, DomainAssembler maps to BC3Document

### ~G — Image/Graphic Attachment

**Occurrences:** 1 in 19-026

**Format:**

```
~G|concept_code|filename.ext\|
```

**Example:**

```
~G|19-026-L3_PC01##|3QE0h_A1j7Qg5Sp4dO8t26Bg.png\|
```

**Semantics:** Links a concept to an external image/graphic file. The trailing `\|` is a terminator.

**Priority:** Low — 1 occurrence. May be a Presto-specific extension.

**Implementation notes:**

- Domain type: extend `Attachment` (already exists in domain)
- Parser: simple field extraction

### ~H — Unknown Type

**Occurrences:** 1 in Excesos-Mod (malformed file, null byte contamination)

**Format:** Unknown — single occurrence in a file with NUL bytes may be a corruption artifact.

**Priority:** Low — likely corruption, not a real record type. Monitor for clean occurrence before implementing.

## Structural patterns needing parser changes

### Multiline ~D records

**Priority:** High — affects 2 of 7 files (29%).

The ARQUIMEDES generator emits ~D records split across multiple lines. The current tokenizer assumes every line starting with `~` is a new record. Continuation lines without `~` are lost.

**Proposed approach:**

1. Add multiline awareness to Tokenizer: buffer lines within a record until the closing `||` is found
2. OR: add a preprocessing step that collapses multiline ~D records before tokenization
3. OR: make ~D parser aware that children may appear on continuation lines (post-tokenizer)

### ISO-8859-1 encoding support

**Priority:** High — affects all 7 files.

Add encoding detection from ~V field 5 (`ANSI` = Windows-1252/ISO-8859-1). Either:

- Accept `Buffer` input and decode in the importer
- Document that users must decode before passing to `BC3.parse()`

### Null byte stripping

**Priority:** Medium — affects 1 malformed file.

Add `\x00` stripping in the preprocessing step or in `StringImporter`.

### Backslash context sensitivity

**Priority:** Medium — affects version string parsing.

The `\` in `FIEBDC-3/2020\02102025` should not be treated as a subfield separator. The ~V parser should handle the version field as a single value with an optional date suffix.

## Spec types with zero corpus occurrence

`~N` (Notes), `~B` (Bibliographic), `~Y` (Layout) have parsers in the codebase but zero occurrences in 7 real-world files. Consider:

- They may be generator-specific extensions (never emitted by Presto/ARQUIMEDES/TCQ)
- They may be deprecated from newer FIEBDC versions
- Keep parsers for completeness but do not prioritize implementation changes for these types

## Progressive support strategy

| Phase | What                          | Rationale                        |
| ----- | ----------------------------- | -------------------------------- |
| 1     | Multiline ~D handling         | Blocks VQUISI + Excesos-Mod      |
| 2     | ~O record type                | 517 occurrences, clear semantics |
| 3     | ISO-8859-1 support            | Blocks all files                 |
| 4     | Null byte stripping           | Unblocks Excesos-Mod             |
| 5     | Backslash context sensitivity | Cleaner version parsing          |
| 6     | ~G record type                | Low priority, 1 occurrence       |
| 7     | ~H investigation              | Possible corruption artifact     |
