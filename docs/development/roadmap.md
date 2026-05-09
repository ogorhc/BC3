# Roadmap — BC3

**Status:** Phases 0–6 complete. v1.1.0 shipped.

## Phase 0 — Planning ✓

- Architecture defined
- Repo structure created
- GitHub Project established (28 items, all Done)

## Phase 1 — Core Infrastructure ✓

- Tokenizer for BC3 records (field `|`, subfield `\`, EOF marker, null byte stripping)
- RecordParser interface (Strategy pattern)
- RecordDispatcher (routing + diagnostics)

## Phase 2 — Domain Model ✓

- ConceptNode, Concept, Decomposition
- Measurement, MeasurementDetail (with partial expression evaluation)
- ChapterNode, Document root (BC3Document)
- Entity, Specification, ITCode, Thesaurus, CostOverride, Coefficients, Attachment

## Phase 3 — Builder ✓

- BC3Builder pipeline: init → on\* → buildStore
- BC3ParseStore → DomainAssembler → BC3Document
- Hierarchy assembly with parent-child relationship linking
- Code change rewriting (~B)

## Phase 4 — Essential Record Types ✓

- ~V (Version/Metadata), ~C (Concept), ~D (Decomposition), ~T (Text)
- ~K (Coefficients), ~M (Measurement), ~N (Notes)
- ~B (Code rename), ~Y (Layout)
- First end-to-end parse

## Phase 5 — Extended Record Types ✓

- **Done:** ~L (Specifications), ~X (IT/BIM/LCA codes), ~E (Entities), ~A (Thesaurus), ~O (Cost Overrides), ~G (Graphics)
- **Not observed in corpus:** ~R, ~F, ~W, ~I — zero occurrences, no spec documentation available

## Phase 6 — Release & Polish ✓

- Documentation complete (docs/, examples.md, README)
- 179 tests passing, CI clean
- 7/7 real-world corpus files parsing with 0 errors
- `getSummary()` — record counts, concept type distribution, measurement/decomposition stats, diagnostic breakdowns
- `summaryToString()` — human-readable summary formatter
- Presto 8.7 hierarchy fix (numeric dotted chapter codes, large integer performances)
- v1.1.0 shipped
