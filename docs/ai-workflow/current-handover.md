# Current Handover

## Active Work

<!-- None -->

## Recent Changes

### 2026-05-06 — SEO: expand npm keywords, optimize README, set GitHub topics

- **package.json keywords** expanded 6 → 21: `fiebdc`, `bc3-parser`, `construction-budget`, `boq`, `presto`, `arquimedes`, `tcq`, etc.
- **README** H1 and opening rewritten with `FIEBDC-3 Parser`, `npm install bc3`, 15+ keyword hits in first viewport.
- **GitHub topics** set: `bc3`, `fiebdc`, `fiebdc-3`, `construction`, `parser`, `typescript`, `nodejs`, `boq`, `cost-estimation`.
- **Commit:** `d2510cf` on `develop`

### 2026-05-06 — Feature: Implement ~G parser, remove ~H references (#108, #109)

- **GParser** implemented — extracts concept code + filename from `~G|code|filename.ext\|`.
- **Pipeline wired**: Builder `onG()` → Store `attachments` → DomainAssembler converts to `Attachment` (type: 'graphic') → `BC3Document.attachments`.
- **4 tests** added in `tests/parsing/dispatch/parsers/GParser.test.ts`.
- **~H removed from all docs/code** — confirmed NUL-byte corruption artifact, not a real BC3 record type.
- **Docs updated**: parser-coverage-matrix (15 parsers, 100%), unsupported-cases, parser-behavior, record-types, work-to-issue-mapping, index, architecture overview, README (14→15 types, 120→126 tests).
- **Branch:** `feat/g-h-parsers`
- Fixes #108, #109

### 2026-05-06 — Fix: backslash context-sensitivity in ~V (#106)

- **VParser** now reconstructs the version field by joining subfields with `\`, then splits on the **last** `\` to separate version from optional date suffix.
- Previously relied on tokenizer's accidental subfield splitting (`f[1][0]`=version, `f[1][1]`=date). Now explicit: `raw = f[1].join('\\')`, `lastBackslash ≥ 0` → version/date split.
- Handles version strings with embedded backslashes (e.g. `FIEBDC-3\2020\02102025` → version=`FIEBDC-3\2020`, date=`02102025`).
- **Added 2 tests** to `tests/parsing/dispatch/parsers/VCParser.test.ts` (preserves explicit backslash, leading backslash edge case).
- **Branch:** `fix/106-v-backslash-context`
- Fixes #106

### 2026-05-06 — SEO P2: description, badges, "Why" block, Related Terms, repo desc

- **package.json description** expanded with `FIEBDC-3/BC3`, `TypeScript parser`, `Presto`, `ARQUIMEDES`, `TCQ`, `bills of quantities`.
- **README badges** added npm downloads + TypeScript 5.9 shield.
- **README "Why BC3"** section inserted before Status — 5 bullets, 8+ keyword hits.
- **README "Related Terms"** section added before License — English/Spanish bilingual glossary (28 term pairs).
- **GitHub repo description** aligned with npm description.
- **Baseline recorded:** npm 8,347 weekly downloads; GitHub 0 stars, 0 forks, 2 weekly views.
- **Commit:** on `develop`

### 2026-05-06 — Feature: strip null bytes from input (#104)

- **Added `stripNullBytes()`** in Tokenizer — removes `\x00` (NUL) bytes before tokenizing. Unblocks Excesos-Mod corpus file (37,713 lines with NUL contamination)
- **Branch:** `feat/104-null-byte-stripping`
- Fixes #104

### 2026-05-06 — Test: add regression tests for untested parsers (#102)

- **Added 17 regression tests** covering ~T, ~M, ~E, ~A, ~X, ~L, ~N, ~B, ~Y, and UnknownRecordParser
- Test file: `tests/parsing/dispatch/parsers/ParserRegression.test.ts`
- All parsers now have at least basic fixture coverage
- **Branch:** `test/102-regression-untested-parsers`
- Fixes #102

### 2026-05-06 — Docs: ISO-8859-1 encoding contract (#100)

- **Documented** in `public-api.md` that ISO-8859-1 decoding is the caller's responsibility (not the library's). All corpus files use Latin-1 — callers must decode before passing to `BC3.parse()` (as demonstrated in `scripts/tokenize.mjs`)
- **Branch:** `feat/100-latin1-encoding-support`
- Fixes #100

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

## Notes

- All 126 tests pass; `npm run ci` passes.
- All observed corpus record types (14) are now implemented (15 parsers including ~N/~B/~Y which have zero corpus occurrences but are spec types).
- Old root-level doc stubs have been deleted. All broken references across the repo have been fixed.
- The DParser heuristic for detecting child codes requires 4+ digit numeric codes or alphanumeric codes. Short numeric codes (1-3 digits) without letters are still treated as percentage codes — this is a pre-existing limitation, not introduced by this fix.

## Next Steps

1. **Task hygiene** — Close stale/duplicate issues, sync GitHub Projects, ensure issues reflect shipped work.
2. **Remaining roadmap items** — Expression evaluator (#88), charset option, concept aliases, etc. (see `docs/development/work-to-issue-mapping.md`).

---

Last updated: 2026-05-06
