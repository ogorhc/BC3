# BC3

**BC3** is an open-source TypeScript library for parsing and modeling
**FIEBDC-3 / BC3** construction database files.

It provides a structured parsing pipeline and a hierarchical object model
representing a BC3 document.

## Status

🚧 Early development — API and architecture are being defined.

## Installation

```bash
npm install bc3
```

## Usage (planned)

```ts
import { BC3 } from 'bc3';

const document = BC3.parse(input);
```

> API subject to change until `v0.1.0`.

## Project workflow

- Development happens on `develop`
- Each change is tracked via GitHub Issues and Projects
- Versioning and releases are managed with **Changesets**
- Publishing to npm is automated on merges to `main`

## Roadmap & docs

- Architecture and parsing pipeline are documented under `docs/`
- See GitHub Projects for the full roadmap and task breakdown

## License

MIT © Igor HC
