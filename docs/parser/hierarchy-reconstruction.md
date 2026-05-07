# Hierarchy Reconstruction Audit

How BC3 parent-child relationships are reconstructed from `~C` + `~D` records, and where hierarchy can be lost.

**Date:** 2026-05-06

---

## Pipeline

```
~C records        ~D records
     │                │
     ▼                ▼
BC3Builder.onC()   BC3Builder.onD()
  → concepts Map     → decompositions Map
     │                     │
     └─────────┬───────────┘
               ▼
     BC3Builder.assembleHierarchy()
     ├── 1st pass: Create ParseNode per concept (normalized code)
     ├── 2nd pass: Walk decompositions, set parentCode + childCodes
     ├── 3rd pass: Identify roots
     └── → { nodes: Map<string, ParseNode>, roots: string[] }
               │
               ▼
     DomainAssembler.buildDocument()
     ├── Pass 1: ParseNode → ConceptNode (drops aliases)
     ├── Pass 2: childCodes → parent.addChild(child) links
     ├── Pass 3: DecompositionLine[] → Decomposition[]
     ├── Pass 5: roots[] → rootNodes[]
     └── → BC3Document { roots, conceptsByCode }
```

---

## Stage 1: `assembleHierarchy()` (BC3Builder)

### Code normalization

`normalizeCode(code)` (`src/builder/store/normalizeCode.ts`):

- Strips leading `##` or `#`
- Strips trailing `#`
- Preserves everything else (including dots, letters, digits)

Examples: `##01` → `01`, `#01#02` → `01#02`, `I.LT04.01#` → `I.LT04.01`

### First pass: create ParseNodes

Every entry in `this.concepts` (populated by `~C` records) becomes a `ParseNode` keyed by normalized code. Text from `~T` is attached if available.

### Second pass: parent-child from decompositions

For each `(parentCode, lines)` in `this.decompositions`:

1. Normalize `parentCode`
2. Look up parent `ParseNode` — if not found, **silently skip the entire decomposition** (no diagnostic)
3. For each line, normalize `childCode`
4. Look up child `ParseNode` — if not found, **silently skip the child** (no diagnostic)
5. Set `childNode.parentCode = normalizedParent` (overwrites if multiple parents)
6. Push `normalizedChild` into `parentNode.childCodes`

### Third pass: root detection

A node is a root if ALL of:

1. `parentCode === null`
2. NOT in the `childCodes` set (i.e., not referenced as a child by any decomposition)
3. Does NOT start with `%` (auxiliary codes like `%CI`, `%MEDAUX`)

If zero roots found, creates a synthetic `__ROOT__` and adds all `parentCode === null` nodes as its children. If even that yields zero, adds all nodes.

---

## Stage 2: `DomainAssembler.buildDocument()` Pass 2

Re-walks `store.nodes` and calls `parent.addChild(child)` for each parent's `childCodes`. The same `ConceptNode` instance can be a child of multiple parents (multi-parent valid in BC3).

---

## Where hierarchy is lost

### 1. Code mismatch between ~C and ~D (silent)

| Scenario                                             | Consequence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `~D` parent code doesn't match any `~C` code         | Entire decomposition skipped — no diagnostic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `~D` child code doesn't match any `~C` code          | Child silently dropped — no diagnostic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `~D` uses `#`-prefixed code but `~C` uses unprefixed | `normalizeCode` strips `#` but the concept map key is the original code from `~C` which may not be normalized. **Potential bug:** `assembleHierarchy()` creates nodes keyed by `normalizeCode(code)`, but the `~D` child lookup uses `normalizeCode(line.code)`. If the `~C` code was stored under the original (non-normalized) key, the lookup fails. → However, this is handled correctly: `this.concepts.entries()` iterates all entries and `normalizeCode()` is applied to each key when creating nodes. So both `~C` key and `~D` reference are normalized. ✓ |

### 2. Missing concepts (~D child with no ~C record)

If a decomposition references a child concept that has no corresponding `~C` record, that child is silently dropped. There is no warning or diagnostic. This can happen when:

- The file is truncated or a record parser failed
- Multiline ~D continuation lines are dropped (ARQUIMEDES issue)
- The exporter emits children in a different batch

### 3. Root detection: single root fallacy

The `roots` array can contain multiple entries. An app that assumes `document.roots[0]` is the one true root may pick the wrong node or an auxiliary concept. Common pattern: `ROOT##` (chapter 0) should be the single root, but if it's absent, multiple chapter nodes become roots.

### 4. Synthetic `__ROOT__`

When no natural roots are found, `assembleHierarchy()` creates a synthetic `__ROOT__` code and collects all parentless nodes. However, the `DomainAssembler` **does not** create a `ConceptNode` for `__ROOT__` — it only uses the list of root codes from the store. So `__ROOT__` is invisible to the consumer. The actual effect is that all parentless nodes appear as flat roots.

### 5. Auxiliary concepts (`%` prefix) excluded from roots

Nodes starting with `%` (e.g., `%CI`, `%MEDAUX`) are explicitly excluded from roots in `assembleHierarchy()`. This is correct for preventing percentage-overhead concepts from appearing as top-level roots, but it also means there is **no way to navigate to them** unless they appear as children in some decomposition.

### 6. Multi-parent ambiguity

When a child has multiple parents (legal in BC3), `parentCode` on `ParseNode` gets the **last** parent assigned. This is intentional — nesting is built from `parent.childCodes`, not from `child.parentCode`. However, if an app navigates from child to parent (rather than parent to child), it will only find **one** parent.

### 7. Empty decompositions map

If `~D` parsing fails or records are dropped (multiline issue, UnknownRecordParser), the `decompositions` map is empty. In this case, ALL concepts have `parentCode === null` and none appear in `childCodes`. The root detection returns all concepts as roots → flat list, no tree.

### 8. Code changes from ~B (code rename records)

`~B` records rename concept codes. `applyCodeChanges()` remaps keys in `concepts`, `decompositions`, `texts`, and `measurements`. If the old code doesn't exist in the map (e.g., `~B` appeared before `~C`), the rename is ignored. Currently `~B` has 0 occurrences in the corpus, so this is untested.

---

## Verifying hierarchy health from a consumer app

```typescript
const result = BC3.parse(input);
const doc = result.document;

// Check 1: are there roots?
console.log(
  'Roots:',
  doc.roots.length,
  doc.roots.map((r) => r.concept.code),
);

// Check 2: do concepts have children?
const withChildren = [...doc.conceptsByCode.values()].filter(
  (n) => n.children.length > 0,
);
console.log('Concepts with children:', withChildren.length);

// Check 3: orphan count (concepts with no parent and not a root)
const roots = new Set(doc.roots);
const orphans = [...doc.conceptsByCode.values()].filter(
  (n) => !roots.has(n) && doc.getParentNodes(n.concept.codeNorm).length === 0,
);
console.log('Orphans:', orphans.length);

// Check 4: hierarchy summary
console.log(doc.getHierarchySummary());

// Check 5: diagnostics — any warnings about missing codes?
for (const d of doc.diagnostics) {
  console.log(`${d.level}: ${d.message}`);
}
```

---

## Known bugs affecting hierarchy

| Bug                                   | Issue                                        | Status             |
| ------------------------------------- | -------------------------------------------- | ------------------ |
| DParser dotted code misclassification | #87                                          | Fixed (2026-05-06) |
| Multiline ~D records (ARQUIMEDES)     | Continuation lines dropped silently          | Open               |
| DParser 1-3 digit numeric child codes | Treated as percentage codes                  | Open (edge case)   |
| Missing code diagnostics              | No warnings when ~D references unknown codes | Open (design gap)  |
