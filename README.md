# BC3

**BC3** is an open-source TypeScript library for parsing and modeling **FIEBDC-3 / BC3** construction database files.

It provides a structured parsing pipeline and a hierarchical object model representing a BC3 document.

## Status

🚧 Early development — API and architecture are being defined.

## Installation

```bash
npm install bc3
```

## Usage (planned)

```ts
import { BC3 } from 'bc3';

const result = BC3.parse(input);
const document = result.document;
```

> API subject to change until `v0.1.0`.

---

## Architecture & documentation

The core architecture and design decisions are documented in the following files:

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

---

## Project workflow

- Development happens on `develop`
- Each change is tracked via GitHub Issues and GitHub Projects
- Versioning and releases are managed with **Changesets**
- Publishing to npm is automated on merges to `main`

## Roadmap

- High-level roadmap and task breakdown are maintained in **GitHub Projects**
- Each architectural decision is documented before implementation

## License

MIT © Igor HC
