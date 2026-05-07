# ADR-003: Lenient Mode as Default

**Status:** Accepted  
**Date:** 2024

## Context

Real-world BC3 files produced by commercial software (ARQUIMEDES, Presto, TCQ, CYPE) frequently contain:

- Non-standard record types (`~O`, `~G`)
- Fields with unexpected formats
- Missing optional fields
- Encoding issues when read as UTF-8

A parser that throws on the first error would be unusable against real-world files.

## Decision

The default parse mode is **lenient** (`mode: 'lenient'` when `options` is omitted).

In lenient mode:

- Unknown record types produce a `warn`-level `Diagnostic` and are skipped.
- Missing or malformed fields produce `warn`-level `Diagnostic` entries and are skipped/defaulted.
- Parsing always completes and always returns a `BC3Document`.

Strict mode (`mode: 'strict'`) is available for validation contexts: it throws on the first error.

## Consequences

- Consumers get a usable document even from imperfect files, with diagnostics describing what was skipped.
- Validation tools can opt into strict mode.
- The dual-mode contract must be maintained as new parsers are added.
- `ctx.diagnostics` must be checked by consumers who care about data quality.
