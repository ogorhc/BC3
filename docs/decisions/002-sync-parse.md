# ADR-002: Synchronous Parsing API

**Status:** Accepted  
**Date:** 2024

## Context

BC3 files are read entirely into memory before parsing (the public API accepts a `string`). Parsing is a pure CPU-bound transformation with no I/O inside the library.

An async API (`BC3.parseAsync()`) was considered to align with ecosystem conventions and to allow future streaming support.

## Decision

`BC3.parse(input, options?)` is **synchronous**. There is no `BC3.parseAsync()`.

## Consequences

- The API is simple: call it, get a result, no `await` required.
- Callers perform their own I/O (reading the file, decoding charset) before calling the library.
- Streaming and partial parsing are out of scope for the current design.
- If streaming is needed in the future, a new entry point (`BC3.stream()` or similar) can be added without breaking the existing synchronous API.
- `BC3.parseAsync()` must not be documented or advertised until it is implemented.
