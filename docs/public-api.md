# Public API Contract

This document defines the **public API** of the `bc3` library: entry points, inputs, options, return types, and sync/async decisions.

The API must remain stable over time. Internal modules (importers/parsing/builder) may evolve without breaking consumers.

> **What is actually implemented (as of v0.7.0):**
>
> ```ts
> BC3.parse(input: string, options?: { mode?: 'strict' | 'lenient' }): ParseResult
> ```
>
> `ParseResult` has `{ document: BC3Document; diagnostics: Diagnostic[] }`.
>
> **Encoding:** `BC3.parse()` accepts a UTF-16 JavaScript string. All real-world BC3 corpus files use ISO-8859-1 (Latin-1) encoding. Callers must decode before parsing:
>
> ```ts
> // Node.js
> const input = fs.readFileSync('file.bc3', 'latin1');
> const result = BC3.parse(input, { mode: 'lenient' });
> ```
>
> Sections below marked **[ASPIRATIONAL]** describe design goals that are **not yet implemented**.

---

## 1. Guiding principles

- Provide a single, ergonomic entry point
- Support Node.js and browser usage
- Do not force filesystem or network dependencies
- Expose diagnostics in a consistent way
- Keep the API compatible with future importers (XML/DB/UI) without changing the main contract

---

## 2. Main entry point

### `BC3.parse(input, options?)`

**Purpose**: Parse a BC3 text input and build a `BC3Document` domain model.

**Input forms** (initial scope):

- `string` (raw BC3 text) — **implemented**
- `Uint8Array` / `ArrayBuffer` (for file buffers; charset handling is importer-specific) — **[ASPIRATIONAL]**

**Options**:

- `mode`: `'strict' | 'lenient'` (default: `'lenient'`) — **implemented**
- `charset`: `'auto' | 'ansi' | '850' | '437'` (default: `'auto'`) — **[ASPIRATIONAL]** not implemented; callers must decode to string
- `collectRawRecords`: `boolean` (default: `false`) — **[ASPIRATIONAL]** not implemented

**Return**: `BC3ParseResult`

---

## 3. Sync vs async decision

### Default: synchronous parsing

BC3 parsing is CPU-bound and does not require IO by default. Therefore:

- `BC3.parse(...)` should be **sync**

This is optimal for:

- parsing already-loaded strings
- deterministic behavior
- easier unit testing

### Optional async variants [ASPIRATIONAL]

Async support can be added without changing the sync API:

- `BC3.parseAsync(input, options?)` — **not implemented**

Use cases:

- large inputs in browser environments
- integration with streams or file reads

---

## 4. Return types

### `BC3ParseResult`

The parsing result is a structured object, not only the document, to ensure diagnostics and metadata are always accessible.

Contains:

- `document`: `BC3Document` — **implemented**
- `diagnostics`: `Diagnostic[]` (warnings/errors) — **implemented**
- `stats` (optional): parse statistics (record counts, duration) — **[ASPIRATIONAL]** not implemented

---

## 5. Domain output types

### `BC3Document`

Publicly exposed as a read-only domain aggregate.

Expected access patterns (implemented):

- `document.metadata` (from ~V)
- `document.roots` — top-level `ConceptNode[]`
- `document.conceptsByCode` — `Map<string, ConceptNode>` keyed by normalized code

Expected access patterns (aspirational / not yet exposed):

- `document.root` (single root concept, if available) — **[ASPIRATIONAL]**
- `document.hierarchy` (chapters/items tree) — **[ASPIRATIONAL]**

---

## 6. Diagnostics exposure

Diagnostics must always be accessible:

- In **strict mode**: parsing throws a structured exception, but it should still be possible to retrieve collected diagnostics if needed.
- In **lenient mode**: diagnostics are returned in `BC3ParseResult.diagnostics`.

Diagnostics include:

- severity (error/warning/info)
- message and code
- record type/index
- optional field/subfield position

---

## 7. Export surface

The library should export:

- `BC3` (main façade)
- Domain types: `BC3Document`, `Concept`, etc.
- Parse types: `BC3ParseOptions`, `BC3ParseResult`, `Diagnostic`

Internal implementation details must not be exported:

- token types
- parsing strategies
- builder internals

---

## 8. Future extensibility (importers) [ASPIRATIONAL]

To support future import sources without breaking changes, the API can evolve to:

- `BC3.from(source, options?)` — **not implemented**

Where `source` may represent:

- BC3 text
- XML
- database adapter
- programmatic builder session

However, the initial stable contract remains:

- `BC3.parse(input, options?)`

---

## 9. Summary

- Primary API: `BC3.parse(input: string, options?: { mode? }): ParseResult` (sync) — **implemented**
- Optional future: `BC3.parseAsync(...)` — **[ASPIRATIONAL]**
- Return: `{ document: BC3Document; diagnostics: Diagnostic[] }` — `stats` is aspirational
- Mode: strict vs lenient
- Keep internal implementation private
