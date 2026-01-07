# BC3

**BC3** is an open-source TypeScript library for parsing and modeling **FIEBDC-3 / BC3** construction database files.

It provides a structured parsing pipeline and a hierarchical object model representing a BC3 document, allowing you to navigate concepts, decompositions, measurements, and relationships in a type-safe way.

## Status

✅ **Active development** — Core parsing and domain model are functional. API is stable for basic usage.

Current version: `v0.6.0`

## Installation

```bash
npm install bc3
```

## Quick Start

```typescript
import { BC3 } from 'bc3';

// Parse a BC3 file
const bc3Text = `~V|RIB Spain|FIEBDC-3/2020\\02102025|Presto 25.00||...
~C|001010|h|CAPATAZ|29.11|020922|1|
...`;

const result = BC3.parse(bc3Text, { mode: 'lenient' });
```

## Features

### ✅ Core Functionality

- **Full BC3 parsing**: Supports all standard BC3 record types (`~V`, `~C`, `~D`, `~M`, `~T`, `~X`, `~L`, `~A`, `~E`, `~K`)
- **Hierarchical model**: Navigate concepts as a tree structure with parent-child relationships
- **Multiple occurrences**: Handle concepts that appear multiple times in different branches
- **Decompositions**: Access factor, performance (rendimiento), and percentage codes
- **Measurements**: Parse measurement data with positions, totals, and details
- **Metadata**: Extract document version, generator, dates, and properties
- **Diagnostics**: Collect warnings and errors during parsing

## API Reference

### `BC3.parse(input, options?)`

Parses a BC3 text input and returns a structured result.

**Parameters:**

- `input` (string): Raw BC3 text content
- `options` (optional):
  - `mode`: `'strict' | 'lenient'` (default: `'lenient'`)

**Returns:** `ParseResult`

```typescript
interface ParseResult {
  document?: BC3Document; // The parsed document
  diagnostics: Diagnostic[]; // Warnings and errors
}
```

### `BC3Document`

The main domain model representing a parsed BC3 file.

**Key methods:**

- `getConcept(code: string)`: Get a concept node by normalized code
- `countConceptOccurrences(code: string)`: Count how many times a concept appears in the tree
- `getAllPathsToConcept(code: string)`: Get all paths from root to a concept
- `getPathToConcept(code: string)`: Get the first path to a concept
- `getParentNodes(code: string)`: Get all parent nodes of a concept
- `getChildNodes(code: string)`: Get direct children of a concept
- `getDecompositionInfo(parentCode, childCode)`: Get decomposition data (performance, factor)
- `getHierarchySummary()`: Get statistics about the tree structure

**Properties:**

- `roots: ConceptNode[]`: Root nodes of the hierarchy
- `conceptsByCode: Map<string, ConceptNode>`: Lookup map for all concepts
- `metadata?: DocumentMetadata`: Document metadata from `~V` record
- `entities: Map<string, Entity>`: Parsed entities
- `specificationsDictionary?: Specification`: Specifications dictionary
- `itCodesDictionary?: ITCodes`: IT codes dictionary

### `ConceptNode`

Represents a node in the hierarchical BC3 structure.

**Properties:**

- `concept: Concept`: The concept data (code, unit, summary, prices, dates, etc.)
- `children: ConceptNode[]`: Direct child nodes
- `decompositions: Decomposition[]`: Decomposition relationships
- `measurements: Measurement[]`: Associated measurements
- `attachments: Attachment[]`: Linked attachments

## Examples

### Navigate the hierarchy

```typescript
const result = BC3.parse(bc3Text);
const document = result.document;

if (document) {
  // Walk the tree
  document.walkTree((node, depth) => {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${node.concept.codeNorm} - ${node.concept.summary}`);
  });

  // Get hierarchy summary
  const summary = document.getHierarchySummary();
  console.log(`Total nodes: ${summary.totalNodes}`);
  console.log(`Max depth: ${summary.maxDepth}`);
}
```

### Find concept occurrences

```typescript
const code = '001010';
const occurrences = document.countConceptOccurrences(code);
console.log(`Concept ${code} appears ${occurrences} times`);

// Get all paths to the concept
const paths = document.getAllPathsToConcept(code);
paths.forEach((path, idx) => {
  console.log(
    `Path ${idx + 1}: ${path.map((n) => n.concept.codeNorm).join(' → ')}`,
  );
});
```

### Access decomposition data

```typescript
const parentCode = '300100';
const childCode = '001010';

const decompInfo = document.getDecompositionInfo(parentCode, childCode);
if (decompInfo) {
  console.log(`Performance: ${decompInfo.performance}`);
  console.log(`Factor: ${decompInfo.factor}`);

  // Calculate amount
  const child = document.getConcept(childCode);
  if (child && child.concept.prices.length > 0) {
    const price = child.concept.prices[child.concept.prices.length - 1];
    const amount = price * (decompInfo.performance || 0);
    console.log(`Amount: ${formatPrice(amount)}`);
  }
}
```

## Parsing Modes

### Lenient (default)

- Continues parsing even when encountering errors
- Collects diagnostics (warnings/errors) but doesn't throw
- Best for production use when you want to handle partial data

### Strict

- Stops parsing on errors
- Useful for validation and debugging
- Throws structured exceptions with diagnostics

## Architecture & Documentation

The core architecture and design decisions are documented in:

- [**Grammar rules**](docs/grammar.md)
  BC3 lexical rules: record delimiters, fields, subfields, and whitespace handling.

- [**Domain model**](docs/domain-model.md)
  Core entities: `BC3Document`, `Concept`, `Decomposition`, `Measurement`, attachments.

- [**Parsing modes**](docs/parsing-modes.md)
  Strict vs lenient parsing, warnings, errors, and diagnostics strategy.

- [**Design patterns**](docs/design-patterns.md)
  Builder, Strategy, and Composite responsibilities and interactions.

- [**Module boundaries**](docs/module-boundaries.md)
  Folder structure, importers, parsing pipeline, and dependency rules.

- [**Public API**](docs/public-api.md)
  Public API contract, sync/async decisions, inputs, outputs, and extensibility.

## Project Workflow

- Development happens on `develop`
- Each change is tracked via GitHub Issues and GitHub Projects
- Versioning and releases are managed with **Changesets**
- Publishing to npm is automated on merges to `main`

## Roadmap

- High-level roadmap and task breakdown are maintained in **GitHub Projects**
- Each architectural decision is documented before implementation

## License

MIT © Igor HC
