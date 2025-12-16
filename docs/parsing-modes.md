# Parsing Modes

This document defines the **parsing modes** supported by BC3 and the associated strategy for errors, warnings, and diagnostics reporting.

---

## 1. Overview

BC3 parsing supports two modes:

- **Strict mode** — full specification compliance
- **Lenient mode** — best-effort parsing with diagnostics

The selected mode affects validation behavior but not the resulting domain model structure.

---

## 2. Strict mode

Strict mode enforces the BC3 specification rigorously.

### Behavior

- Invalid records cause parsing to **fail immediately**
- Missing required fields result in **errors**
- Unknown record types are **rejected**
- Invalid numeric formats or expressions throw errors

### Use cases

- Validation tools
- Import pipelines requiring correctness guarantees
- QA or regulatory environments

---

## 3. Lenient mode

Lenient mode prioritizes resilience and data recovery.

### Behavior

- Unknown record types are **ignored**
- Invalid fields generate **warnings** instead of errors
- Missing optional fields are tolerated
- Parsing continues whenever possible

### Use cases

- Real-world BC3 files with inconsistencies
- Exploratory data analysis
- Legacy data import

---

## 4. Diagnostics model

All non-fatal issues are collected as diagnostics.

### Diagnostic levels

- **Error** — parsing cannot continue (strict mode)
- **Warning** — data issue, parsing continues
- **Info** — non-critical informational messages

### Diagnostic attributes

- Record type
- Record index
- Field / subfield position
- Message code and description

---

## 5. Error handling strategy

- Strict mode throws on first error
- Lenient mode aggregates diagnostics and completes parsing
- The resulting `BC3Document` exposes diagnostics for inspection

---

## 6. API surface (conceptual)

```ts
BC3.parse(input, {
  mode: 'strict' | 'lenient',
});
```

---

## 7. Summary

| Aspect                  | Strict | Lenient  |
| ----------------------- | ------ | -------- |
| Unknown records         | Error  | Ignore   |
| Missing required fields | Error  | Warning  |
| Invalid values          | Error  | Warning  |
| Parsing continuation    | Stop   | Continue |

This parsing mode separation ensures both correctness and robustness while maintaining a single domain model.
