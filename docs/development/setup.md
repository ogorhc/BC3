# Local Development Setup

## Prerequisites

- Node.js ≥ 20 (CI runs on Node 20)
- npm ≥ 10

## Install

```bash
git clone <repo>
cd bc3js
npm install
```

## Build

```bash
npm run build
```

Runs `tsup`. Output goes to `dist/`:

- `dist/index.js` — ESM
- `dist/index.cjs` — CJS
- `dist/index.d.ts` — Type declarations

TypeScript type-checking happens during the tsup build. There is no standalone `tsc --noEmit` command.

## Tests

```bash
npm test             # run all tests once
npm run test:watch   # re-run on file changes
```

Tests use `node:test` (Node.js built-in) + `tsx` as a TypeScript loader.
Test files live in `tests/` mirroring `src/` structure (`tests/**/*.test.ts`).

## Formatting

```bash
npm run check-format   # check (CI gate)
npm run format         # auto-fix
```

Prettier is enforced by a husky pre-commit hook via lint-staged.
Config: single quotes, trailing commas, 80 print width, LF line endings.

## CI gate

```bash
npm run ci   # build + format check
```

This is what the GitHub Actions workflow runs. Must pass before merging.

## Key TypeScript flags

`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` — do not relax these.

## Scratch scripts

`scripts/` is gitignored. You can add ad-hoc scripts there without polluting the repo.
Example smoke test:

```bash
npm run build && node scripts/tokenize.mjs ./scripts/file.bc3
```

## Corpus files

BC3 real-world samples are in `data/bc3-corpus/samples/real-world/`.
They are **read-only** reference files — never modify them.
All are ISO-8859-1 + CRLF encoded.
