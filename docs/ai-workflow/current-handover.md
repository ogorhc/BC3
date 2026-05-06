# Current Handover

## Active Work

<!-- None -->

## Recent Changes

### 2026-05-06 — Fix: verify KParser handles negative digit counts (#98)

- **Added test** for `-9` digit count (VQUISI corpus pattern). KParser stores subfields as strings — no code change needed
- **Branch:** `fix/98-k-negative-digit-counts`
- Fixes #98

### 2026-05-06 — Fix: ~D records emit diagnostics for unmatched codes (#96)

- **Added warn-level diagnostics** in `BC3Builder.assembleHierarchy()` when ~D parent or child code does not match any ~C concept
- Previously these were silently skipped — now emit `BC3_D_MISSING_PARENT_CODE` and `BC3_D_MISSING_CHILD_CODE`
- **Added 3 regression tests** in `tests/api/DSilentDiagnostics.test.ts`
- **Branch:** `fix/96-d-silent-diagnostics`
- Fixes #96

### 2026-05-06 — Feature: parse ~O records (#94)

- **Created `CostOverride` domain class** with `conceptCode` + `locations[]` (`CostLocation: { location, price }`)
- **Created `OParser`** — splits location\price pairs from ~O records
- **Added full pipeline**: builder `onO()` → `BC3ParseStore.costOverrides` → `DomainAssembler` pass → `BC3Document.costOverrides`
- **Added 4 regression tests** in `tests/api/OParser.test.ts`
- **Branch:** `feat/94-parse-o-records`
- Fixes #94 — 517 ~O records across 3 corpus files now parse into domain model

### 2026-05-06 — Fix: ~K coefficient data exposed in BC3Document (#92)

- **Created `Coefficients` domain class** in `src/domain/Coefficients.ts` holding `legacy`, `full`, `raw` from `KDecimalsInput`
- **Added `coefficients` property** to `BC3Document`
- **Updated `DomainAssembler`** to build `Coefficients` from `store.decimals` and pass to document constructor
- **Added 3 regression tests** in `tests/api/KCoefficients.test.ts`
- **Branch:** `fix/92-connect-k-coefficients`
- Fixes #92 — ~K data was parsed but silently lost; now accessible on `document.coefficients`

### 2026-05-06 — Fix: multiline ~D records from ARQUIMEDES generator

- **Fixed DParser** to handle ARQUEMEDES multiline format where continuation lines omit performance/rendimiento values (2 subfields per child instead of 3)
- DParser now detects when the performance slot contains a child code and backs up to consume it as the next child's code
- Extracted `looksLikeChildCode` into a shared private method
- **Added 4 integration tests** in `tests/parsing/dispatch/parsers/DParser.multiline.test.ts`
- **Updated** `docs/bc3-knowledge/known-edge-cases.md` edge case #1 — now partially resolved
- **Branch:** `fix/multiline-d-tokenizer`
- 92 tests pass, CI clean

### 2026-05-06 — Fix: ~D record dotted child code parsing (#87)

- **Fixed DParser bug** where child codes containing dots (e.g. `WORKER.1a`) caused subsequent children to be misclassified as percentage codes. Root cause: `elem.includes('.')` heuristic matched decimal factor/performance values. Added decimal number exclusion and alphanumeric child code detection.
- **Added 5 regression tests** in `tests/parsing/dispatch/parsers/DParser.test.ts`
- **Updated** `docs/bc3-knowledge/known-edge-cases.md` with edge case #10
- **Branch:** `fix/87-decomposition-dot-child-code`
- Fixes #87

### 2026-05-06 — Documentation restructuring

Reorganized all `docs/` content into a clear, navigable directory layout. Fixed inaccuracies found across multiple docs.

**New directories and files created:**

- `docs/architecture/` — `index.md`, `overview.md`, `module-boundaries.md` (updated real folder layout), `design-patterns.md`
- `docs/domain/` — `index.md`, `model.md`
- `docs/parser/` — `index.md`, `grammar.md`, `parsing-modes.md`, `record-parsers.md` (full per-type reference)
- `docs/development/` — `index.md`, `setup.md`, `release-process.md`, `roadmap.md`
- `docs/decisions/` — `index.md`, ADR-001 (zero deps), ADR-002 (sync parse), ADR-003 (lenient default), ADR-004 (single-pass tokenizer)
- `docs/bc3-knowledge/index.md`

**Inaccuracies fixed:**

- `docs/ai-workflow/ai-context.md` — updated test framework from "None" to `node:test + tsx`; updated documentation map to new paths; updated repository structure diagram
- `docs/public-api.md` — marked aspirational features (`charset`, `collectRawRecords`, `BC3.parseAsync()`, `BC3.from()`, `stats`) with `[ASPIRATIONAL]` annotations; added "what is actually implemented" summary at top
- `docs/parser/parsing-modes.md` — corrected: unknown records are warned (not silently ignored) in lenient mode; strict mode throws (not just errors)
- `docs/architecture/module-boundaries.md` — replaced proposed folder layout with actual `src/` structure
- `.ai/skills/bc3-parser.md` — updated fixture format from placeholder to real `node:test` test template
- `docs/ai-workflow/index.md` — removed stale `add-tests.md` playbook entry; updated doc map and verification commands; updated module-boundaries path

### 2026-05-06 — Test framework setup

- **Installed `tsx`** as a devDependency (TypeScript loader for `node:test`)
- **Added `test` and `test:watch` scripts** to `package.json`
- **Added `npm test` step** to `.github/workflows/ci.yml`
- **Updated `AGENTS.md`** — added test framework section with commands
- **Created 83 tests across 3 test files**:
  - `src/api/BC3.test.ts` — 25 tests
  - `src/parsing/Tokenizer.test.ts` — 27 tests
  - `src/parsing/dispatch/parsers/VCParser.test.ts` — 31 tests

### 2026-05-06 — BC3 corpus analysis

- **Analyzed 7 real-world BC3 files**, 4 valid / 2 edge-case / 1 malformed
- **Created `docs/bc3-knowledge/`** with 5 knowledge files
- **Created `data/bc3-corpus/metadata/samples.index.json`**

## Blockers

- Specification PDFs (`docs/specifications/Formato-FIEBDC-3-202{0,4}.pdf`) cannot be directly read — `pdftotext` unavailable. Version-differences knowledge is corpus-inferred only.
- `~H` record type found in Excesos-Mod may be a NUL-byte corruption artifact.

## Notes

- All 103 tests pass; `npm run ci` passes.
- Old root-level doc stubs have been deleted. All broken references across the repo have been fixed.
- The DParser heuristic for detecting child codes requires 4+ digit numeric codes or alphanumeric codes. Short numeric codes (1-3 digits) without letters are still treated as percentage codes — this is a pre-existing limitation, not introduced by this fix.

## Next Steps

1. **ISO-8859-1 encoding support** — all corpus files are Latin-1.
2. **Regression tests for untested parsers** — 10 of 13 parsers have no dedicated tests.
3. **Null byte stripping preprocessor** — unblocks Excesos-Mod.
4. **Backslash context-sensitivity in ~V** — `FIEBDC-3/2020\02102025` uses `\` as date separator.

---

Last updated: 2026-05-06
