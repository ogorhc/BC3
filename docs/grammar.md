# BC3 Grammar Rules

This document defines the **core lexical and structural grammar rules** used by BC3 (FIEBDC-3) files. These rules are the foundation for tokenization and parsing.

---

## 1. Record delimiter

- Each record **starts with `~`** (tilde).
- The first character after `~` defines the **record type** (e.g. `V`, `C`, `D`, `M`).
- Records end at the start of the next `~` or end-of-file.

Example:

```text
~V|FIEBDC-3|2020
~C|01|Concrete
```

---

## 2. Field delimiter (`|`)

- Fields inside a record are separated by the **pipe character `|`**.
- Empty fields are allowed and represented by consecutive delimiters.

Example:

```text
~C|01||Concrete
```

Here:

- Field 1 = `01`
- Field 2 = empty
- Field 3 = `Concrete`

---

## 3. Subfield delimiter (`\\`)

- Subfields inside a field are separated by a **backslash (`\\`)**.
- Subfields preserve order and meaning as defined by the record type.

Example:

```text
~C|01\\A|Concrete
```

Subfields of field 1:

- `01`
- `A`

---

## 4. Whitespace handling

- Leading and trailing whitespace **must be ignored** for fields and subfields.
- Whitespace **inside text values** is preserved.

Example:

```text
~C| 01 |  Concrete block
```

Parsed as:

- Code: `01`
- Description: `Concrete block`

---

## 5. Empty and optional values

- Empty fields and subfields are valid unless explicitly forbidden by the record specification.
- Parsers must not fail on missing optional fields in **lenient mode**.

---

## 6. Unknown records

- Records with unknown types must be:
  - Ignored in **lenient mode**
  - Reported as errors in **strict mode**

---

## 7. Line endings

- Files may use `\n`, `\r\n`, or mixed line endings.
- Line endings must not affect parsing logic.

---

## 8. Summary

| Element            | Symbol          |     |
| ------------------ | --------------- | --- |
| Record start       | `~`             |     |
| Field separator    | `               | `   |
| Subfield separator | `\\`            |     |
| Whitespace         | Trimmed (outer) |     |

These grammar rules apply uniformly to all BC3 record types and are used by the tokenizer stage of the parsing pipeline.
