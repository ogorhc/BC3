# BC3

**BC3** is an open-source TypeScript library for parsing and modeling FIEBDC-3 / BC3
construction database files.

This repository provides the core parsing architecture and the hierarchical
object model representing a BC3 document.

## Status

🚧 Planning phase — No implementation yet.

## Goals

- Parse BC3 files and build a complete hierarchical structure.
- Provide a clean TypeScript API: `BC3.parse(file)`.
- Support all record types (~V, ~C, ~D, ~M, etc.).
- Be fully extensible via Strategy + Builder patterns.
- MIT licensed and maintained publicly.

## Documentation

- `docs/architecture.md`
- `docs/roadmap.md`
- `docs/standards.md`

## License

MIT © Igor HC
