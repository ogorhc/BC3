# Analyze BC3 Sample Playbook

## When to Use

Analyzing a new `.bc3` sample file and integrating it into the reference corpus.

## Project Rules (hard)

- Files under `data/bc3-corpus/samples/real-world/` are **reference material** — never modify them
- Analysis is **read-only** — do not change file contents, encoding, or structure
- Tests use **string fixtures**, not modified corpus files
- Document edge cases **before** any parser change

## Steps

### 1. Place the File (one-time)

Copy the new BC3 file into `data/bc3-corpus/samples/real-world/`. From this point forward, the file is read-only reference material.

### 2. File-Level Inspection

```bash
file <path>
wc -l <path> && wc -c <path>
file -bi <path>
hexdump -C <path> | head -20
```

Capture: encoding, BOM, line count, file size, MIME type.

### 3. Record Type Inventory

```bash
cat <path> | LC_ALL=C grep -oP '^~[A-Za-z]' | sort | uniq -c | sort -rn
```

Also count continuation lines:

```bash
total=$(wc -l < <path>); tilde=$(grep -c '^~' <path>); echo "$((total - tilde)) continuation lines"
```

### 4. Structure Inspection

- ~V header: extract generator, FIEBDC version, encoding, all fields
- First 10 lines, last 5 lines
- Check for `~~` start-of-file marker
- Verify separator consistency

### 5. Content Spot-Checks

- ~C records: code hierarchy pattern (`#` suffix), concept type codes
- ~D records: single-line vs multiline, percentage nodes
- ~T and ~M: text and measurement formats
- ~X records: IT code format, BIM/LCA metadata format
- ~O records (if present): location-based price overrides

### 6. Edge Case Detection

| Check                | Command                                                    |
| -------------------- | ---------------------------------------------------------- | ---------- |
| Null bytes           | `grep -c $'\x00' <path>`                                   |
| Non-standard decimal | Check ~C/~M fields for comma vs period                     |
| Negative ~K digits   | `grep '~K                                                  | -' <path>` |
| Empty ~V vendor      | Inspect ~V field 1                                         |
| Unknown record types | Compare output of step 3 against known 13 types + ~O/~G/~H |

### 7. Classify

- `valid` — clean, standard BC3, all types recognized by parser
- `edge-case` — valid BC3 with dialect quirks, unsupported types, or non-standard formatting
- `malformed` — syntax errors, corrupt content, null byte contamination

### 8. Write Fixture (optional, for known-good portions)

If the file contains valid BC3 that exercises a parser path, extract a representative string fixture for use in the eventual test suite. Store in notes or the metadata entry.

### 9. Update Knowledge Base

**Always update these files:**

1. `data/bc3-corpus/metadata/samples.index.json` — add entry with all fields
2. `docs/bc3-knowledge/record-types.md` — update occurrence matrix if new types found
3. `docs/bc3-knowledge/known-edge-cases.md` — document any new edge cases
4. `docs/bc3-knowledge/parser-behavior.md` — note if new gaps found
5. `docs/bc3-knowledge/unsupported-cases.md` — add any new unsupported types
6. `docs/ai-workflow/current-handover.md` — summarize findings

### 10. Complete

Run `npm run format` on changed docs, then `npm run ci` to verify.

## Related Playbooks

- `create-feature.md` — implement support for newly discovered record types
- `fix-bug.md` — fix parser behavior on newly discovered edge cases
