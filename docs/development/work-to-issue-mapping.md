# BC3 Library: Work-to-Issue Mapping

**Date:** 2026-05-06
**Basis:** Parser/hierarchy audit (`docs/parser/parser-coverage-matrix.md`, `docs/parser/hierarchy-reconstruction.md`), corpus analysis (`docs/bc3-knowledge/`), and GitHub Project (28 items, all Done).

---

## Project Status

The BC3 GitHub Project tracked Phases 0–3 (Setup → Architecture → Pipeline → MVP Records). All 28 project items are Done. The project has no Phase 4+ items defined for post-MVP work.

**1 open issue:** #88 — `Implement expression evaluator` (evaluates a,b,c,d expressions with constant p for measurement detail formulas).

---

## Audit Findings → Issue Mapping

### A. Missing parsers (corpus-inferred types)

| Finding                                            | Severity | Existing issue? | Proposed issue                                   |
| -------------------------------------------------- | -------- | --------------- | ------------------------------------------------ |
| `~O` — 517 occurrences, cost overrides by location | High     | None            | `[Feature]: Parse ~O records (cost overrides)`   |
| `~G` — 1 occurrence, image/graphic attachment      | Low      | None            | `[Feature]: Parse ~G records (image attachment)` |

### B. Parsed but disconnected

| Finding                                                                          | Severity                   | Existing issue?                                                                 | Proposed issue                                              |
| -------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `~K` coefficients parsed but lost (`store.decimals` never transferred to domain) | High                       | #62 tracks initial `~K` parsing as Done, but domain connection was out of scope | `[Bug]: ~K coefficient data is not exposed in BC3Document`  |
| Concept aliases (`~C` codes[1+]) silenty dropped                                 | Medium                     | None                                                                            | `[Feature]: Preserve concept code aliases`                  |
| `Attachment` domain type exists but never populated                              | Medium                     | None                                                                            | `[Feature]: Populate Attachment objects from parsed data`   |
| Unknown record content discarded (diagnostic only)                               | Medium                     | None                                                                            | `[Feature]: Preserve unknown record content in diagnostics` |
| `~B` code change history not surfaced                                            | Low (0 corpus occurrences) | None                                                                            | `[Feature]: Expose code change history in BC3Document`      |

### C. Hierarchy reconstruction gaps

| Finding                                                                    | Severity | Existing issue?                          | Proposed issue                                                  |
| -------------------------------------------------------------------------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| Multiline `~D` continuation lines silently dropped (3,897 lines in VQUISI) | High     | None (documented in knowledge base only) | `[Bug]: Tokenizer drops multiline ~D continuation lines`        |
| `~D` code mismatches produce no diagnostics                                | Medium   | None                                     | `[Bug]: ~D records silently skip children with unmatched codes` |
| 1-3 digit numeric child codes treated as percentage codes                  | Low      | #87 partially related                    | `[Bug]: Short numeric child codes misclassified in ~D`          |
| `%` auxiliary concepts excluded from roots with no navigation path         | Low      | #80 closed (fixed)                       | Already addressed                                               |

### D. Real-world BC3 compatibility

| Finding                                                | Severity    | Existing issue? | Proposed issue                                            |
| ------------------------------------------------------ | ----------- | --------------- | --------------------------------------------------------- |
| ISO-8859-1 encoding — all 7 corpus files are Latin-1   | High        | None            | `[Feature]: Support ISO-8859-1 input encoding`            |
| Null byte contamination in Excesos-Mod (100% of lines) | Medium      | None            | `[Feature]: Strip null bytes from input`                  |
| `~K` negative digit counts (VQUISI)                    | Medium      | None            | `[Bug]: KParser fails on negative digit counts`           |
| `~V` backslash ambiguity in version strings            | Low         | None            | `[Bug]: ~V version field with backslash date separator`   |
| `~X` lines up to 27,598 chars with 300+ BIM/LCA pairs  | Low (works) | None            | `[Bug]: Performance/stability on extremely long ~X lines` |

### E. Public API and contract

| Finding                                                    | Severity | Existing issue?                     | Proposed issue                                       |
| ---------------------------------------------------------- | -------- | ----------------------------------- | ---------------------------------------------------- |
| `charset` option documented but not implemented            | Medium   | None (documented as [ASPIRATIONAL]) | `[Feature]: Implement charset option in BC3.parse()` |
| `collectRawRecords` option documented but not implemented  | Low      | None                                | `[Feature]: Implement collectRawRecords option`      |
| `BC3.parseAsync()` documented but not implemented          | Low      | None                                | `[Feature]: Implement BC3.parseAsync()`              |
| `stats` in ParseResult documented but not implemented      | Low      | None                                | `[Feature]: Add parse statistics to ParseResult`     |
| `BC3.from()` source factory documented but not implemented | Low      | None                                | `[Feature]: Implement BC3.from() source factory`     |

### F. Test coverage gaps

| Finding                                                     | Severity | Existing issue? | Proposed issue                                      |
| ----------------------------------------------------------- | -------- | --------------- | --------------------------------------------------- |
| No tests for ~K, ~T, ~M, ~N, ~B, ~Y, ~L, ~X, ~E, ~A parsers | High     | None            | `[Test]: Add regression tests for untested parsers` |
| No integration test with real corpus file                   | Medium   | None            | `[Test]: Add real-world corpus integration test`    |
| No test for hierarchy root detection edge cases             | Medium   | None            | `[Test]: Add hierarchy regression tests`            |
| No test for CHANGESET path (never triggered in CI)          | Low      | None            | `[Test]: Add changeset workflow test`               |

### G. Already tracked

| Finding                                                  | Issue    | Status                    |
| -------------------------------------------------------- | -------- | ------------------------- |
| `~D` dotted child code bug                               | #87      | Closed (fixed 2026-05-06) |
| `%` auxiliary concepts in roots                          | #80      | Closed (fixed)            |
| Expression evaluator for measurement formulas            | #88      | Open                      |
| All Phase 0-3 items (parsers, pipeline, hierarchy, docs) | 28 items | All Done                  |

---

## Recommended Implementation Order

Based on severity, dependency, and consumer impact:

### Priority 1: Fix data loss (bugs)

| #   | Proposed issue                                                  | Why first                                                                                                 |
| --- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | `[Bug]: Tokenizer drops multiline ~D continuation lines`        | Blocks full parsing of ARQUIMEDES files (29% of corpus). Also blocks hierarchy for 3,897 lines in VQUISI. |
| 2   | `[Bug]: ~K coefficient data is not exposed in BC3Document`      | Parsed data silently lost; no domain type exists. Blocks economic calculations.                           |
| 3   | `[Bug]: ~D records silently skip children with unmatched codes` | Missing diagnostics mask hierarchy gaps.                                                                  |
| 4   | `[Bug]: KParser fails on negative digit counts`                 | Blocks VQUISI ~K record.                                                                                  |

### Priority 2: Implement missing parsers

| #   | Proposed issue                                   | Why                                                                   |
| --- | ------------------------------------------------ | --------------------------------------------------------------------- |
| 5   | `[Feature]: Parse ~O records (cost overrides)`   | 517 occurrences across 3 files — second most common unsupported type. |
| 6   | `[Feature]: Parse ~G records (image attachment)` | 1 occurrence. Low priority, keeps spec compliance. Default to low.    |

### Priority 3: Real-world compatibility

| #   | Proposed issue                                 | Why                                                            |
| --- | ---------------------------------------------- | -------------------------------------------------------------- |
| 7   | `[Feature]: Support ISO-8859-1 input encoding` | All 7 corpus files are Latin-1; currently callers must decode. |
| 8   | `[Feature]: Strip null bytes from input`       | Unblocks Excesos-Mod.                                          |

### Priority 4: Test coverage

| #   | Proposed issue                                      | Why                                                                      |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| 9   | `[Test]: Add regression tests for untested parsers` | 10 of 13 parsers have no tests. Required before any parser modification. |

### Priority 5: API maturity

| #   | Proposed issue                        | Why                                  |
| --- | ------------------------------------- | ------------------------------------ |
| 10  | `[Feature]: Implement charset option` | Most impactful aspirational feature. |

### Priority 6: Structural improvements

| #   | Proposed issue                               | Why                                     |
| --- | -------------------------------------------- | --------------------------------------- |
| 11  | `[Feature]: Preserve concept code aliases`   | Data currently discarded.               |
| 12  | `[Feature]: Populate Attachment objects`     | Domain type exists, never used.         |
| 13  | `[Feature]: Preserve unknown record content` | Unknown records are warned + discarded. |

---

## Suggested Labels

| Label              | For                                      |
| ------------------ | ---------------------------------------- |
| `bug`              | Data loss, incorrect behaviour           |
| `feature`          | Missing parsers, new capabilities        |
| `test`             | Test coverage gaps                       |
| `spec-compat`      | FIEBDC-3 format compliance items         |
| `corpus-blocker`   | Issues that prevent parsing corpus files |
| `P0` / `P1` / `P2` | Priority as defined above                |

---

## Dependencies

```
Multiline ~D tokenizer  ──→  ~O parser  ──→  ISO-8859-1  ──→  Null byte stripping
       │                        │
       └──→  ~D diagnostics     └──→  ~K domain connection

~K domain connection  ──→ all cost calculations

Regression tests  ──→  any parser change (must precede all P1 deliverables)
```

The **multiline ~D fix** is the critical path. It unblocks ARQUIMEDES parsing and enables the hierarchy to be reconstructed for 29% of corpus files. Until resolved, any hierarchy- or decomposition-related work on VQUISI yields incomplete results.

---

## Issue #88 (Expression Evaluator)

Issue #88 is the only open issue. It targets measurement detail formula evaluation (`a*b*c*d+p`) in `~M` records. This is a self-contained feature with no blockers. It can proceed independently. However, the multiline `~D` fix has broader corpus impact and should be tackled first.

---

## Next recommended task

**Fix multiline `~D` record handling** (tokenizer change). This is the single highest-impact bug: 29% of corpus files affected, 3,897 lines dropped silently in VQUISI alone. Every `~D`-dependent feature (hierarchy, resource calculations, cost rollup) is broken for ARQUIMEDES files until this is fixed. No issue exists yet — needs to be created as `[Bug]: Tokenizer drops multiline ~D continuation lines`.

### Approach

1. Create the issue ([Bug] type)
2. Create branch `fix/XX-multiline-d-tokenizer`
3. Write a fixture test with multiline ~D content (from VQUISI pattern)
4. Modify `Tokenizer.ts` to buffer continuation lines within a `~D` record until the next `~` or EOF
5. Verify all existing tests pass + new regression test
6. Update `docs/bc3-knowledge/known-edge-cases.md` and `docs/bc3-knowledge/parser-behavior.md`

### Rationale

The multiline `~D` issue is the #1 blocker listed in `docs/bc3-knowledge/unsupported-cases.md` Phase 1, is documented as edge case #1 in `known-edge-cases.md`, and blocks all hierarchy-dependent features on ARQUIMEDES files. Fixing it unlocks the second-largest record count block and makes the hierarchy reconstruction audit actionable for those files.
