# Fix: Zorrozaurre hierarchy — analysis & development plan

**Date:** 2026-05-07
**File:** `PRESUPUESTO BC3_ZORROZAURRE.bc3` (FIEBDC-3/2002, Presto 8.7)

---

## 1. Problem summary

The parser loses hierarchy for Presto 8.7 files. Specifically:

- Concepts `2.2` through `2.18` should be children of concept `2` but appear as **root nodes** in the tree.
- In `output.json`, concept `2`'s only child is `2.1`, and `2.2` is misclassified as a `percentageCode`.
- Concepts like `EDA0300013`, `URG0440002_N`, `SSC0100005`, etc. appear as roots when they should be children under `2.1`, `2.12.1`, `2.15`, etc.
- Numeric values (quantities/performances like `6990`, `1173`, `2825`) are treated as concept codes, producing `BC3_D_MISSING_CHILD_CODE` warnings.
- `output.json` has **44 root codes**; the expected tree has **1 root** (`2`).

---

## 2. Files analyzed

| File                                      | Role                                        |
| ----------------------------------------- | ------------------------------------------- |
| `scripts/PRESUPUESTO BC3_ZORROZAURRE.csv` | Expected hierarchy from ilovebc3.com export |
| `scripts/output.json`                     | Current library output                      |
| `scripts/PRESUPUESTO_BC3_ZORROZAURRE.bc3` | Original BC3 file                           |
| `src/parsing/dispatch/parsers/DParser.ts` | ~D record parser                            |
| `src/builder/BC3Builder.ts`               | Hierarchy assembly + percentage handling    |

---

## 3. Root cause analysis

### 3.1 The `looksLikeChildCode` heuristic is broken for Presto 8.7

The `looksLikeChildCode()` function in `DParser.ts:33` determines whether a subfield value is a child code or not. The rules:

```ts
(elem.match(/^[0-9]{4,}$/) && elem.length >= 4)(
  // Rule A: 4+ digit numeric codes
  elem.includes('.') && !/^\d+(\.\d+)?$/.test(elem),
); // Rule B: dotted codes NOT matching decimal
elem.match(/^[A-Z]+\.[A-Z]/)(
  // Rule C: UPPER.UPPER
  /[a-zA-Z]/.test(elem) && /\d/.test(elem),
); // Rule D: alphanumeric
elem.startsWith('%'); // Rule E: % codes
```

**Bug A:** Codes like `2.2`, `2.3`, ..., `2.18` **match the decimal number pattern** `/^\d+(\.\d+)?$/`, causing Rule B to return false. Rule D also fails (no letters). Result: `looksLikeChildCode("2.2")` returns **false** → treated as a percentage code.

**Bug B:** Numeric performances like `6990`, `1173`, `2825` match Rule A (4+ digits) → treated as child codes. Rule A cannot distinguish between a concept code like `01160` and a performance value like `6990`.

### 3.2 How the bugs cascade

For the `~D|2#|` record:

```
2.1\1\1\2.2\1\1\2.3\1\1\2.4\1\1\...
```

The parser loops in triplets (code, factor, performance). At i=0:

- code=`2.1`, factor=`1`, performance=`1` ✓
- percentageEnd = 3, starts collecting: `2.2` → NOT a child code (Bug A) → collected as percentage
- `1` → NOT a child code → collected as percentage
- `1` → NOT a child code → percentage
- `2.3` → NOT a child code → percentage
- ... continues until end of field

Result: `2` has 1 child (`2.1`) with percentageCodes containing `["2.2", "1", "1", "2.3", ...]`. All remaining children (`2.2`–`2.18`) are lost from the decomposition and become orphaned roots.

For the `~D|2.1#|` record:

```
URG0100001\1\6990\EDA0300013\1\1173\...
```

At i=0:

- code=`URG0100001`, factor=`1`, performance=`6990`
- `looksLikeChildCode("6990")` → matches Rule A (4+ digits) → **true**
- Parser thinks `6990` is the next child, backs up → performance set to undefined
- Next iteration: code=`6990`, factor=`EDA0300013`, performance=`1`
- `EDA0300013` matches Rule D (has letters + digits) → tells the parser this is a child code
- This means the parser splits at wrong boundaries, corrupting the decomposition

### 3.3 Root cause in DParser

**File:** `src/parsing/dispatch/parsers/DParser.ts`
**Function:** `looksLikeChildCode()` (line 33)
**Affected lines:** 33-41, 83-90, 96-113

The heuristic fails for Presto 8.7 files because:

1. Concept codes like `2.2` use dot notation but match decimal regex
2. Performance values are pure numbers indistinguishable from numeric concept codes
3. No validation against the actual concept map to verify if a candidate code exists

---

## 4. Detected differences

### 4.1 Missing parent-child relationships

| Expected parent | Expected child | Status in output.json                      |
| --------------- | -------------- | ------------------------------------------ |
| 2               | 2.2            | Missing — in percentageCodes, then as root |
| 2               | 2.3            | Missing — as root                          |
| 2               | 2.4            | Missing — as root                          |
| 2               | 2.5            | Missing — as root                          |
| 2               | 2.6            | Missing — as root                          |
| 2               | 2.7            | Missing — as root                          |
| 2               | 2.8            | Missing — as root                          |
| 2               | 2.9            | Missing — as root                          |
| 2               | 2.10           | Missing — as root                          |
| 2               | 2.11           | Missing — as root                          |
| 2               | 2.12           | Missing — as root                          |
| 2               | 2.13           | Missing — as root                          |
| 2               | 2.15           | Missing — as root                          |
| 2               | 2.18           | Missing — as root                          |
| 2.1             | EDA0300013     | Missing — corrupted ~D parsing             |
| 2.1             | URG0202009_N   | Missing — corrupted ~D parsing             |
| 2.1             | URG0520001     | Missing — corrupted ~D parsing             |
| 2.12.1          | URG0440002_N   | Missing — as root                          |
| 2.15            | SSD0100002     | Missing — as root                          |
| 2.15            | SSD0200001     | Missing — as root                          |
| 2.15            | SSC0300001     | Missing — as root                          |
| 2.3             | URV0100003     | Missing — as root                          |

### 4.2 Concepts incorrectly listed as rootCodes

44 concepts appear as roots. All except `RZOCT2019#` (the top-level budget concept) and `2` should have parents:

| Root code    | Expected parent | Cause                                         |
| ------------ | --------------- | --------------------------------------------- |
| 2.2–2.18     | 2               | ~D parsing: codes misclassified as percentage |
| EDA0300013   | 2.1             | ~D parsing: performance 6990 treated as code  |
| URG0440002_N | 2.12.1          | Inherited from parent corruption              |
| SSD0100002   | 2.15            | Inherited from parent corruption              |
| SSC0100005   | 2.15            | As root                                       |
| URA0100015_N | unknown         | ~D parsing                                    |
| etc.         |                 |                                               |

### 4.3 Suspicious percentage classifications

| Parent | Decomposition has                             | Issue                                              |
| ------ | --------------------------------------------- | -------------------------------------------------- |
| 2      | percentageCodes=["2.2", "1", "1", "2.3", ...] | All are valid concepts or factors, not percentages |

### 4.4 Numeric values treated as concept codes

| Value | In ~D record for    | Actual role            | Warnings                   |
| ----- | ------------------- | ---------------------- | -------------------------- |
| 6990  | 2.1 → URG0100001    | Performance (quantity) | `BC3_D_MISSING_CHILD_CODE` |
| 1173  | 2.1 → EDA0300013    | Performance (quantity) | `BC3_D_MISSING_CHILD_CODE` |
| 2825  | 2.10 → URV0300001   | Performance (quantity) | `BC3_D_MISSING_CHILD_CODE` |
| 1300  | 2.10 → URI0100002   | Performance (quantity) | `BC3_D_MISSING_CHILD_CODE` |
| 325   | 2.10 → URI0100002_N | Performance (quantity) | `BC3_D_MISSING_CHILD_CODE` |

---

## 5. Proposed solution

### Phase 1 — Regression tests

Create test fixtures from Zorrozaurre file:

```
tests/fixtures/zorrozaurre/d-zorrozaurre.test.ts
```

Tests validating:

- `2` is the only root of the Zorrozaurre tree
- `2.2` through `2.18` are children of `2` (not percentages, not roots)
- `URG0100001` is a child of `2.1` with performance `6990`
- `EDA0300013` is a child of `2.1`
- `URV0310001` is a child of `2.10`
- Existing non-Zorrozaurre fixtures are not broken

### Phase 2 — Fix `looksLikeChildCode`

Current logic has 2 bugs. Proposed replacement:

```ts
private looksLikeChildCode(elem: string): boolean {
  // Pure numeric: reject — performances/quantities are also pure numeric.
  // The only way to distinguish them is to check against the concept map.
  if (/^\d+$/.test(elem)) return false;

  // Percent sign: percentage code, not a concept
  if (elem.startsWith('%')) return true;

  // Alphanumeric with dot (e.g. I.LT04.01, WORKER.1a): child code
  if (elem.includes('.') && !/^\d+(\.\d+)?$/.test(elem)) return true;

  // Pure letter codes: child code
  if (/^[A-Z]+(\.[A-Z]+)?$/.test(elem)) return true;

  // Alphanumeric (letters + digits): child code
  if (/[a-zA-Z]/.test(elem) && /\d/.test(elem)) return true;

  // Dot-only numeric (e.g. 2.1, 2.10, 3.5.1): child codes in Presto
  // These look like decimals but are actually chapter/subchapter codes
  if (elem.includes('.')) return true;

  return false;
}
```

Key changes:

1. **Removed** `elem.match(/^[0-9]{4,}$/)` — pure numerics are rejected as child codes
2. **Removed** `elem.length >= 4` constraint — any dotted code is a child code
3. **Added** fallthrough for dotted numeric codes (chapter codes like `2.1`, `10.3.5`)

### Phase 3 — Validate child codes against concept map

Add optional validation step that cross-references candidate child codes with the known concept map. If `BC3Builder` is processing ~D records after ~C records (which it does in the current flow), the concept map is available.

```ts
// In DParser, after detecting a potential child code:
if (this.looksLikeChildCode(elem)) {
  // Prefer code that exists in concept map over lookalike
  // This handles edge cases where a performance value happens to match
}
```

### Phase 4 — Fix percentage code collection

The percentage collection loop (DParser.ts:99-113) should stop collecting when it encounters a value that `looksLikeChildCode` identifies as a code. With the fix in Phase 2, this will automatically work correctly for Presto 8.7 files.

### Phase 5 — Validation and warnings

Add:

- `BC3_D_PURE_NUMERIC_SUSPICIOUS` — when a pure-numeric subfield is found between known child code positions (maybe a misparsed performance)
- `BC3_D_CHILD_CODE_NOT_FOUND` — already exists, but ensure it fires correctly after fixes

---

## 6. Acceptance criteria

- `2` is the only main root of the Zorrozaurre budget (plus `RZOCT2019#`)
- `2.2`, `2.3`, ..., `2.18` are children of `2`
- `2.2` no longer appears as `percentageCodes` of `2`
- Pure numeric values (6990, 1173, 2825) are not treated as `childCode`
- Key relationships from ilovebc3 CSV exist in `output.json`
- All existing 147 tests pass
- New Zorrozaurre-specific regression tests added
- `npm run diagnose` produces correct tree for Zorrozaurre

---

## 7. Implementation order

### Task 1 — Add Zorrozaurre test fixtures

- Copy `.bc3` file to `tests/fixtures/zorrozaurre/` (or reference from `data/bc3-corpus/`)
- Create expected values map from CSV analysis
- **File:** `tests/parsing/dispatch/parsers/DParser.zorrozaurre.test.ts`

### Task 2 — Fix `looksLikeChildCode` heuristic

- **File:** `src/parsing/dispatch/parsers/DParser.ts:33-41`
- Remove 4+ digit numeric rule; accept all dotted codes as child codes
- **Risk:** ARQUIMEDES multiline format regression

### Task 3 — Validate existing tests pass

- Run full test suite
- Check ARQUIMEDES multiline tests still pass
- Check DParser dotted child code tests still pass

### Task 4 — Update docs

- `docs/bc3-knowledge/known-edge-cases.md` — add Presto 8.7 edge case
- `docs/parser/record-parsers.md` — update ~D parsing notes

---

## 8. Risks

| Risk                                    | Mitigation                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| ARQUIMEDES multiline regression         | Run `DParser.multiline.test.ts` suite; the ARQUIMEDES format uses code+factor (2 subfields), so pure-numeric rejection shouldn't affect it |
| Decimal performance regression (`0.76`) | "0.76" matches decimal pattern and won't be recognized as child code — correct                                                             |
| ~K negative performance regression      | Not affected — different parser                                                                                                            |

---

## 9. References

- `src/parsing/dispatch/parsers/DParser.ts` — ~D parser with `looksLikeChildCode`
- `src/builder/BC3Builder.ts:73-76` — `onD()` method
- `src/builder/BC3Builder.ts:183-252` — `assembleHierarchy()`
- `tests/parsing/dispatch/parsers/DParser.multiline.test.ts` — ARQUIMEDES tests
- `tests/parsing/dispatch/parsers/DParser.test.ts` — dotted child code tests
