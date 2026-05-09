# BC3 Library: Work-to-Issue Mapping

**Date:** 2026-05-07
**Basis:** Parser/hierarchy audit (`docs/parser/parser-coverage-matrix.md`), corpus analysis (`docs/bc3-knowledge/`), GitHub Project (28 items, all Done).

---

## Project Status

All 28 GitHub Project items (Phases 0–3) are Done. 179 tests pass. 7/7 real-world corpus files parse with 0 errors. 15 of 16 spec record types implemented (16 parsers including ~N/~B/~Y with zero corpus occurrences). v1.1.0 shipped with `getSummary()` + `summaryToString()`.

**0 open issues.**

---

## Completed (shipped)

### A. v1.1.0 — Summary & diagnostics API

| Finding                                                          | Issue | Status |
| ---------------------------------------------------------------- | ----- | ------ |
| `getSummary()` — record counts, concept type distribution, stats | new   | Done   |
| `summaryToString()` — human-readable summary formatter           | new   | Done   |
| Dispatcher-based record counting                                 | new   | Done   |
| Presto 8.7 hierarchy fix (numeric dotted codes, large int perf)  | #144  | Done   |

### B. Missing parsers — all implemented

| Finding                                | Issue | Status                    |
| -------------------------------------- | ----- | ------------------------- |
| ~O — 517 occurrences, cost overrides   | #94   | Done                      |
| ~G — 1 occurrence, image attachment    | #108  | Done                      |
| ~H — 1 occurrence, NUL-byte corruption | #109  | Confirmed not a real type |

### B. Parsed but disconnected — fixed

| Finding                      | Issue | Status                    |
| ---------------------------- | ----- | ------------------------- |
| ~K coefficients lost         | #92   | Done                      |
| ~D missing code diagnostics  | #96   | Done                      |
| Attachment domain type empty | #108  | Done (population from ~G) |

### C. Hierarchy reconstruction — fixed

| Finding                                  | Issue                 | Status |
| ---------------------------------------- | --------------------- | ------ |
| Multiline ~D continuation lines (VQUISI) | multiline-d-tokenizer | Done   |
| ~D code mismatches no diagnostics        | #96                   | Done   |
| Dotted child codes (WORKER.1a)           | #87                   | Done   |

### D. Real-world compatibility — fixed

| Finding                               | Issue | Status                     |
| ------------------------------------- | ----- | -------------------------- |
| ISO-8859-1 encoding                   | #100  | Deferred to caller         |
| Null byte contamination (Excesos-Mod) | #104  | Done                       |
| ~K negative digit counts              | #98   | Done (string pass-through) |
| ~V backslash ambiguity                | #106  | Done                       |

### E. Test coverage — fixed

| Finding                         | Issue | Status                     |
| ------------------------------- | ----- | -------------------------- |
| No tests for 10 parsers         | #102  | Done (17 regression tests) |
| No integration test with corpus | #129  | Done (7 corpus files)      |

### F. Expression evaluator

| Finding                          | Issue | Status |
| -------------------------------- | ----- | ------ |
| Measurement formula a\*b\*c\*d+p | #88   | Done   |

---

## Genuine Remaining Work

### Priority 2: Structural improvements

| Finding                                   | Proposed issue                                              |
| ----------------------------------------- | ----------------------------------------------------------- |
| Concept code aliases silently dropped     | `[Feature]: Preserve concept code aliases`                  |
| Unknown record content discarded          | `[Feature]: Preserve unknown record content in diagnostics` |
| ~B code change history not surfaced       | `[Feature]: Expose code change history in BC3Document`      |
| Raw field strings lost in domain assembly | `[Feature]: Preserve raw field data in domain model`        |
| store.source / store.raw never exposed    | `[Feature]: Expose source metadata in BC3Document`          |

### Priority 3: API maturity

| Finding                                         | Issue                                                         |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `charset` option documented but not implemented | `[Feature]: Implement charset option in BC3.parse()`          |
| `collectRawRecords` option not implemented      | `[Feature]: Implement collectRawRecords option`               |
| `BC3.parseAsync()` not implemented              | `[Feature]: Implement BC3.parseAsync()`                       |
| ~~`stats` in ParseResult not implemented~~      | Done (v1.1.0) — `document.getSummary()` + `summaryToString()` |
| `BC3.from()` source factory not implemented     | `[Feature]: Implement BC3.from() source factory`              |

### Priority 4: Lower-impact

| Finding                                                         | Proposed issue                                         |
| --------------------------------------------------------------- | ------------------------------------------------------ |
| 1-3 digit numeric child codes treated as percentage codes in ~D | `[Bug]: Short numeric child codes misclassified in ~D` |
| ~N, ~B, ~Y parsers have zero corpus occurrences                 | Keep parsers but defer changes                         |
| ~R, ~F, ~W, ~I — spec types, zero corpus, no documentation      | No action until evidence emerges                       |

---

## Suggested Labels

| Label              | For                               |
| ------------------ | --------------------------------- |
| `bug`              | Data loss, incorrect behaviour    |
| `feature`          | Missing parsers, new capabilities |
| `test`             | Test coverage gaps                |
| `spec-compat`      | FIEBDC-3 format compliance items  |
| `P1` / `P2` / `P3` | Priority as defined above         |
