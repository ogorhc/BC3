# Core Domain Model

This document defines the **core domain entities** used to represent a BC3 (FIEBDC-3) document once parsed. These entities are independent of parsing logic and reflect the conceptual model of the standard.

---

## 1. BC3Document

Represents a complete BC3 file.

**Responsibilities**:

- Acts as the root aggregate
- Holds global metadata
- Provides access to all parsed records and the hierarchical structure

**Key properties (conceptual)**:

- metadata (version, generator, date, etc.)
- concepts (indexed collection)
- hierarchy (chapters / items tree)
- diagnostics (warnings and errors)

---

## 2. Record

Abstract representation of a raw BC3 record.

**Responsibilities**:

- Represent a single `~X` record
- Preserve original field/subfield values

**Characteristics**:

- Identified by record type (`V`, `C`, `D`, `M`, etc.)
- Immutable after parsing

Concrete record types are modeled separately but share this base abstraction.

---

## 3. Concept

Represents a BC3 **concept** (unit, chapter, or item).

**Responsibilities**:

- Hold identifying codes
- Store descriptive and economic information
- Act as a node in the hierarchical structure

**Key aspects**:

- Code (with normalized variants)
- Unit of measure
- Prices and dates
- Descriptive text

---

## 4. Decomposition

Represents the decomposition of a concept into sub-concepts.

**Responsibilities**:

- Define parent–child economic relationships
- Store coefficients, factors, and percentages

**Key aspects**:

- Parent concept reference
- Child concept reference
- Quantity / factor / rendement

---

## 5. Measurement

Represents measurement data associated with a concept.

**Responsibilities**:

- Store quantities and expressions
- Support subtotals and totals

**Key aspects**:

- Measurement lines
- Expression-based calculations
- Optional labels (ETIQUETA)

---

## 6. Attachments

Represents external resources linked to concepts.

**Responsibilities**:

- Reference documents, graphics, or BIM files
- Resolve URLs using base paths

**Key aspects**:

- Attachment type
- URL or file reference
- Optional metadata

---

## 7. Relationships overview

```text
BC3Document
 ├─ Concepts
 │   ├─ Concept
 │   │   ├─ Decompositions
 │   │   │   └─ Concept
 │   │   └─ Measurements
 │   └─ Attachments
 └─ Diagnostics
```

---

## 8. Notes

- Domain models must not depend on parsing or IO logic
- Parsing strategies populate these models via a Builder
- This model is designed to evolve incrementally as record support grows
