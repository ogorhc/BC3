# Public API Contract

This document defines the **public API** of the `bc3` library: entry points, inputs, options, return types, and sync/async decisions.

The API must remain stable over time. Internal modules (importers/parsing/builder) may evolve without breaking consumers.

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

- `string` (raw BC3 text)
- `Uint8Array` / `ArrayBuffer` (for file buffers; charset handling is importer-specific)

**Options**:

- `mode`: `'strict' | 'lenient'` (default: `'lenient'`)
- `charset`: `'auto' | 'ansi' | '850' | '437'` (default: `'auto'`)
- `collectRawRecords`: `boolean` (default: `false`) — whether to keep raw record tokens

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

### Optional async variants

Async support can be added without changing the sync API:

- `BC3.parseAsync(input, options?)`

Use cases:

- large inputs in browser environments
- integration with streams or file reads

---

## 4. Return types

### `BC3ParseResult`

The parsing result is a structured object, not only the document, to ensure diagnostics and metadata are always accessible.

Contains:

- `document`: `BC3Document`
- `diagnostics`: `BC3Diagnostics` (warnings/errors)
- `stats` (optional): parse statistics (record counts, duration)

---

## 5. Domain output types

### `BC3Document`

Publicly exposed as a read-only domain aggregate.

Expected access patterns:

- `document.metadata` (from ~V)
- `document.root` (root concept, if available)
- `document.conceptsByCode` (lookup)
- `document.hierarchy` (chapters/items tree)

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

## 8. Future extensibility (importers)

To support future import sources without breaking changes, the API can evolve to:

- `BC3.from(source, options?)`

Where `source` may represent:

- BC3 text
- XML
- database adapter
- programmatic builder session

However, the initial stable contract remains:

- `BC3.parse(input, options?)`

---

## 9. Summary

- Primary API: `BC3.parse(input, options?)` (sync)
- Optional future: `BC3.parseAsync(...)`
- Return: structured result (`document + diagnostics + stats`)
- Mode: strict vs lenient
- Keep internal implementation private
