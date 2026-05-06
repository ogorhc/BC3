# BC3

[![npm version](https://img.shields.io/npm/v/bc3)](https://www.npmjs.com/package/bc3)
[![license](https://img.shields.io/npm/l/bc3)](./LICENSE)
[![CI](https://github.com/ogorhc/BC3/actions/workflows/ci.yml/badge.svg)](https://github.com/ogorhc/BC3/actions/workflows/ci.yml)

**BC3** is a zero-dependency TypeScript library for parsing and navigating **FIEBDC-3 / BC3** construction database files.

It transforms `.bc3` files exported by Presto, ARQUIMEDES, TCQ, and other construction software into a structured, type-safe hierarchical model. Navigate chapters, subchapters, decomposition trees, measurements, entities, specifications, IT/BIM codes, thesauri, geographic cost overrides, and cost coefficients — all with lossless fidelity to the original file.

## Status

**Active development** — 14 of 16 record types parsed, 100% of observed corpus types supported, 119 regression tests.

Current version: `v0.7.0`

## Installation

```bash
npm install bc3
```

## Quick Start

```typescript
import { BC3 } from 'bc3';

const result = BC3.parse(bc3Text, { mode: 'lenient' });

if (result.document) {
  console.log(`Root concepts: ${result.document.roots.length}`);
  console.log(`Total concepts: ${result.document.conceptsByCode.size}`);
  console.log(`Diagnostics: ${result.diagnostics.length}`);

  // Walk the hierarchy
  result.document.walkTree((node, depth) => {
    console.log(
      `${'  '.repeat(depth)}${node.concept.codeNorm} — ${node.concept.summary}`,
    );
  });
}
```

## Features

### Parsing

- **14 record-type parsers** — `~V` through `~O`, plus `UnknownRecordParser`
- **Real-world corpus support** — tested against 7 BC3 files from Presto, ARQUIMEDES, and TCQ spanning FIEBDC-3/2002–2020
- **Multiline ~D records** — ARQUIMEDES continuation lines parsed correctly
- **Dotted child codes** — `WORKER.1a`, `I.LT04.01` handled correctly in decompositions
- **Geographic cost overrides** — `~O` records with location/price pairs
- **Dual parsing modes** — `'lenient'` (collect diagnostics, continue) and `'strict'` (fail on first error)
- **Encoding-agnostic** — accepts UTF-16 strings; callers decode Latin-1 before calling `BC3.parse()`

### Domain model

- **Hierarchy tree** — chapters, subchapters, and items as `ConceptNode` instances with parent-child traversal
- **Multiple occurrences** — concepts appearing in multiple branches tracked correctly
- **Decompositions** — factor, performance (rendimiento), and percentage codes
- **Measurements** — positions, totals, BIM IDs, dimensions
- **Metadata** — document version, generator, dates, and properties from `~V`
- **Cost coefficients** — currency, rounding, overhead rates from `~K`
- **Entities** — companies, persons, and contacts from `~E`
- **Specifications** — pliegos sections from `~L`
- **IT / BIM codes** — BIM parameters, LCA environmental data from `~X`
- **Thesaurus** — keyword classification from `~A`
- **Geographic overrides** — regional cost adjustments from `~O`
- **Diagnostics** — warnings and errors with codes, messages, and record positions

### Architecture

- **Zero runtime dependencies** — pure TypeScript, no npm dependencies
- **ESM-native** — dual CJS/ESM output via tsup
- **TypeScript strict mode** — `noUncheckedIndexedAccess`, `noImplicitOverride`
- **Builder pattern** — clean separation between parsing and domain assembly
- **Strategy pattern** — one parser class per record type, independently testable

## API Reference

### `BC3.parse(input, options?)`

Parses a BC3 text input and returns a structured result.

```typescript
const result: ParseResult = BC3.parse(input: string, options?: {
  mode?: 'strict' | 'lenient';  // default: 'lenient'
});

interface ParseResult {
  document?: BC3Document;
  diagnostics: Diagnostic[];
}
```

> **Encoding:** BC3 corpus files use ISO-8859-1 (Latin-1). Callers must decode before parsing:
>
> ```typescript
> import fs from 'node:fs';
> const input = fs.readFileSync('file.bc3', 'latin1');
> const result = BC3.parse(input, { mode: 'lenient' });
> ```

### `BC3Document`

| Property                   | Type                            | Description                            |
| -------------------------- | ------------------------------- | -------------------------------------- |
| `roots`                    | `ConceptNode[]`                 | Root nodes of the hierarchy            |
| `conceptsByCode`           | `Map<string, ConceptNode>`      | All concepts, keyed by normalized code |
| `metadata`                 | `DocumentMetadata \| undefined` | Version, generator, dates from `~V`    |
| `coefficients`             | `Coefficients \| undefined`     | Currency, rounding, overhead from `~K` |
| `costOverrides`            | `Map<string, CostOverride>`     | Geographic price adjustments from `~O` |
| `entities`                 | `Map<string, Entity>`           | Companies and contacts from `~E`       |
| `specificationsDictionary` | `Specification \| undefined`    | Pliegos sections from `~L`             |
| `itCodesDictionary`        | `ITCodes \| undefined`          | IT/BIM/LCA codes from `~X`             |
| `diagnostics`              | `Diagnostic[]`                  | Warnings and errors                    |

| Method                                | Description                                                           |
| ------------------------------------- | --------------------------------------------------------------------- |
| `getConcept(code)`                    | Lookup a `ConceptNode` by normalized code                             |
| `walkTree(visitor)`                   | DFS traversal with `(node, depth, path)` callback                     |
| `getHierarchySummary()`               | `{ totalNodes, rootNodes, maxDepth, nodesByDepth }`                   |
| `getAllPathsToConcept(code)`          | All paths from roots to a concept                                     |
| `getParentNodes(code)`                | All parent nodes of a concept                                         |
| `getChildNodes(code)`                 | Direct children                                                       |
| `getDecompositionInfo(parent, child)` | `{ performance?, factor? }`                                           |
| `countConceptOccurrences(code)`       | Occurrence count in the tree                                          |
| `getResourceHierarchy()`              | Concepts grouped by resource type (labor, machinery, materials, etc.) |

### `ConceptNode`

| Property         | Type                         | Description                                    |
| ---------------- | ---------------------------- | ---------------------------------------------- |
| `concept`        | `Concept`                    | Code, unit, summary, prices, dates, type, text |
| `children`       | `ConceptNode[]`              | Direct children in hierarchy                   |
| `decompositions` | `Decomposition[]`            | Parent-child economic relationships            |
| `measurements`   | `Measurement[]`              | Associated measurements                        |
| `specification`  | `Specification \| undefined` | Pliego sections                                |
| `itCodes`        | `ITCodes \| undefined`       | IT/BIM codes                                   |
| `thesaurus`      | `Thesaurus \| undefined`     | Keywords                                       |

## Examples

### Navigate the hierarchy

```typescript
const result = BC3.parse(bc3Text);
const doc = result.document;

if (doc) {
  const summary = doc.getHierarchySummary();
  console.log(
    `Roots: ${summary.rootNodes}, Total: ${summary.totalNodes}, Depth: ${summary.maxDepth}`,
  );

  doc.walkTree((node, depth) => {
    console.log(
      `${'  '.repeat(depth)}${node.concept.codeNorm} — ${node.concept.summary}`,
    );
  });
}
```

### Find concept occurrences

```typescript
const paths = doc.getAllPathsToConcept('001010');
paths.forEach((path, i) => {
  console.log(
    `Path ${i + 1}: ${path.map((n) => n.concept.codeNorm).join(' → ')}`,
  );
});

const decompInfo = doc.getDecompositionInfo('300100', '001010');
if (decompInfo) {
  const child = doc.getConcept('001010')!;
  const price = child.concept.prices.at(-1)!;
  console.log(`Amount: ${price * (decompInfo.performance ?? 0)}`);
}
```

### Parse a Latin-1 encoded file (Node.js)

```typescript
import fs from 'node:fs';
import { BC3 } from 'bc3';

const input = fs.readFileSync('file.bc3', 'latin1');
const result = BC3.parse(input, { mode: 'lenient' });

// Check diagnostics
for (const d of result.diagnostics) {
  console.log(`[${d.level}] ${d.code}: ${d.message}`);
}
```

## Parsing Modes

| Mode                | Unknown records | Missing fields  | Invalid values  | Behavior                  |
| ------------------- | --------------- | --------------- | --------------- | ------------------------- |
| `lenient` (default) | Warn + skip     | Warn + continue | Warn + continue | Always returns a document |
| `strict`            | Throw           | Throw           | Throw           | Fails on first error      |

## Architecture & Documentation

| Topic                    | Document                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| Architecture overview    | [`docs/architecture/overview.md`](docs/architecture/overview.md)                         |
| Module boundaries        | [`docs/architecture/module-boundaries.md`](docs/architecture/module-boundaries.md)       |
| Design patterns          | [`docs/architecture/design-patterns.md`](docs/architecture/design-patterns.md)           |
| BC3 grammar              | [`docs/parser/grammar.md`](docs/parser/grammar.md)                                       |
| Record parsers           | [`docs/parser/record-parsers.md`](docs/parser/record-parsers.md)                         |
| Parsing modes            | [`docs/parser/parsing-modes.md`](docs/parser/parsing-modes.md)                           |
| Parser coverage          | [`docs/parser/parser-coverage-matrix.md`](docs/parser/parser-coverage-matrix.md)         |
| Hierarchy reconstruction | [`docs/parser/hierarchy-reconstruction.md`](docs/parser/hierarchy-reconstruction.md)     |
| Domain model             | [`docs/domain/model.md`](docs/domain/model.md)                                           |
| Public API               | [`docs/public-api.md`](docs/public-api.md)                                               |
| Development setup        | [`docs/development/setup.md`](docs/development/setup.md)                                 |
| Roadmap                  | [`docs/development/work-to-issue-mapping.md`](docs/development/work-to-issue-mapping.md) |
| ADRs                     | [`docs/decisions/index.md`](docs/decisions/index.md)                                     |

## Project Workflow

- Development on `develop`; production on `main`
- Branch naming: `feat/`, `fix/`, `test/`, `docs/`, `chore/` prefixed with issue number
- Changesets for versioning; automated npm publish on merge to `main`
- `npm run ci` gates all PRs: build + format check

## License

MIT © Igor HC
