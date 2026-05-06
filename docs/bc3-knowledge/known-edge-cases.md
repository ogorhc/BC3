# Known Edge Cases

Edge cases discovered in the real-world BC3 corpus that deviate from the standard single-line, ASCII, well-formed BC3 model.

## 1. Multiline ~D records (ARQUIMEDES generator)

**File:** `PRESUPUESTO-VQUISI.bc3` (FIEBDC-3/2012, ARQUIMEDES)

**Pattern:** ~D decomposition records where child concepts are split across multiple continuation lines:

```
~D|QUISI_V02##
|CAP.01#\\1
\CAP.02#\\1
\CAP.03#\\1
\||
```

**Impact:** 3,897 continuation lines (62% of total lines). The parser's tokenizer currently uses `~` as record boundary — continuation lines starting without `~` would be discarded as garbage or attached to the next record.

**Mitigation:** Tokenizer must recognize `|` or `\` at line-start as continuation of the previous record, OR the multiline ~D must be collapsed before tokenization.

## 2. Null byte contamination

**File:** `250617_Modificado2_v10(Excesos-Mod).bc3` (FIEBDC-3/2002, Presto 8.8)

**Pattern:** Every single line (37,713 total) contains one or more NUL (`0x00`) bytes. The file is 6.6 MB with only ~2,855 actual record-starting lines. The remaining 34,858 lines are a mix of multiline record continuations and null-byte padding.

Example hex dump:

```
00000070  0a 7e 4f 7c 25 45 58 30  36 7c 30 30 30 5c 36 5c  |.~O|%EX06|000\6\|
00000080  30 30 31 5c 30 5c 30 30  32 5c 30 7c 0d 0a 7e 43  |001\0\002\0|..~C|
```

**Impact:** Cannot be parsed without preprocessing. grep reports "binary file matches." The parser would need to strip NUL bytes before tokenization.

**Mitigation:** Add a preprocessing step: `input.replace(/\x00/g, '')` or handle in the tokenizer.

## 3. ISO-8859-1 encoding (universal)

**Pattern:** All 7 files use ISO-8859-1 (Latin-1), not UTF-8. Spanish accented characters (á, é, í, ó, ú, ñ, ü) and special symbols (°, €) are single-byte Latin-1.

**Impact:** If the parser assumes UTF-8, Spanish text will render with replacement characters (�) or cause parse failures.

**Mitigation:** Accept ISO-8859-1 input. The `~V` header field 5 (encoding) specifies `ANSI` in all corpus files, which in Spanish Windows environments means code page 1252 (Windows-1252), a superset of ISO-8859-1.

## 4. Extremely long lines (BIM metadata in ~X)

**File:** `TSL-DP-PCI-01-01-PT-00001-Presupuesto-LT04-RV02.bc3` (FIEBDC-3/2020, Presto 25.00)

**Pattern:** ~X records containing Revit BIM property metadata reach 27,598 characters per line. The ~L header alone is 630 characters. Many ~X records contain 300+ parameter key-value pairs.

**Impact:** Tokenizer must handle arbitrarily long lines. Field-level splitting could produce large arrays.

**Mitigation:** Ensure no hardcoded line-length limits in the tokenizer. Stream-based parsing may be needed for very large files.

## 5. Backslash ambiguity

**Pattern:** The `\` character serves multiple roles:

- Subfield separator in all record types
- Version date separator in ~V: `FIEBDC-3/2020\02102025`
- Path separator in ~L specification sections: `ESP\Especificación\TEC\Características técnicas\`
- Escape character in ~D continuations (ARQUIMEDES multiline)

**Impact:** If backslash is treated uniformly as a subfield separator, the version string gets incorrectly split, and specification section paths get fragmented.

**Mitigation:** Backslash semantics must be context-dependent per record type.

## 6. Empty vendor field in ~V

**File:** `250617_Modificado2_v10.BC3` (FIEBDC-3/2016, TCQ 6.2)

**Pattern:** `~V||FIEBDC-3/2016\150126|TCQ 6.2||ANSI||2||||`

Field 1 (vendor) is empty. The TCQ generator emits no vendor name.

**Impact:** Parser expecting non-empty vendor field would fail or produce incorrect results.

**Mitigation:** All ~V fields should be treated as optional.

## 7. ~O records with geographic overrides

**Files:** 19-026, 21-028, Excesos-Mod

**Pattern:** `~O|01#|Alicante\288293.19\Andalucía\286082.96\Aragón\290709.78\|`

These records contain location-specific cost multipliers. The value is a flat sequence of `location_name\price` pairs using backslash as the pair separator.

**Impact:** Currently unsupported — falls through to UnknownRecordParser.

## 8. ~K negative digit counts

**File:** `PRESUPUESTO-VQUISI.bc3`

**Pattern:** `~K|-9\3\3\3\2\2\2\2\EUR\|...`

The first digit group is `-9` (negative). The digit count fields in ~K specify decimal places for price display.

**Impact:** Parser expecting unsigned integers for digit counts would fail on negative values.

## 9. `.BC3` uppercase extension

**File:** `250617_Modificado2_v10.BC3`

Some generators use uppercase `.BC3` file extension. The file content is identical to `.bc3` files.

## 10. Dotted child codes in ~D records

**Reproduction:** `https://github.com/janplancraft/bc3-bug-reproduction`

Child concept codes containing dots (e.g. `WORKER.1a`, `I.LT04.01`) trigger an ambiguous subfield group detection. The DParser heuristic used `elem.includes('.')` to detect the next child code boundary, but decimal factor/performance values also contain dots (e.g. `1.200`, `0.500`). This caused subsequent children to be misclassified as percentage codes.

**Resolution:** Fixed in the DParser lookahead heuristic:

- Exclude decimal numbers (`/^\d+(\.\d+)?$/`) from the dot-based child code detection
- Add alphanumeric detection (`/[a-zA-Z]/.test(elem) && /\d/.test(elem)`) for child codes without dots like `MAT01`, `WORKER2b`
