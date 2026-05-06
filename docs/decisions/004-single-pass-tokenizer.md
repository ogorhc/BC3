# ADR-004: Single-Pass Line Tokenizer (No Multiline Record Support)

**Status:** Accepted (with known gap)  
**Date:** 2024

## Context

The FIEBDC-3 spec allows `~D` decomposition records to span multiple lines — continuation lines do not start with `~`. Some BC3 exporters (notably ARQUIMEDES) use this feature extensively: the VQUISI corpus file has 3,897 continuation lines (62% of its content).

Two tokenizer designs were considered:

1. **Multi-pass / stateful**: track "current record type", accumulate continuation lines.
2. **Single-pass**: each line starting with `~` is a complete record; lines not starting with `~` are dropped.

## Decision

The tokenizer is **single-pass**. Lines that do not start with `~` are silently dropped.

This was the initial implementation choice for simplicity. The gap is documented as a known issue.

## Consequences

- Simple, fast, easy to reason about.
- Multi-line `~D` records from ARQUIMEDES files are silently truncated — only the first line of each record is parsed.
- A `warn` diagnostic for dropped continuation lines is not yet emitted.
- Fixing this requires a stateful tokenizer that buffers lines between `~` prefixes. This is the highest-priority known parser gap (see `docs/bc3-knowledge/known-edge-cases.md`).
- The fix must be made before ARQUIMEDES files can be considered fully supported.
