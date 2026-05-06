# ADR-001: Zero Runtime Dependencies

**Status:** Accepted  
**Date:** 2024

## Context

BC3 is a parsing library intended to be embedded in CLI tools, build pipelines, and web apps. Each runtime dependency adds transitive risk: version conflicts, security surface, bundle size, and compatibility concerns for both Node.js and browser targets.

## Decision

The library has **zero runtime dependencies** (`dependencies: {}` in `package.json`).

All parsing, domain modelling, and assembly is implemented in plain TypeScript using Node.js built-ins only. `devDependencies` (tsup, tsx, prettier, etc.) are permitted.

## Consequences

- Library consumers can install it without pulling in any transitive packages.
- Bundle size is minimal.
- Every utility must be written in-house (e.g. `src/utils/strings.ts`).
- External parsing helpers (e.g. `chevrotain`, `nearley`) cannot be used even if convenient.
- This constraint is enforced by code review — there is no automated check.
