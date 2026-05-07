# Design Patterns

This document describes the **design patterns** used by BC3 and how they interact to form a flexible, extensible parsing architecture.

The chosen patterns are:

- **Builder**
- **Composite**
- **Strategy**

These patterns are complementary and address different responsibilities.

---

## 1. Strategy pattern — parsing behavior

### Purpose

The Strategy pattern is used to encapsulate **record-specific parsing logic**.

Each BC3 record type (`~V`, `~C`, `~D`, `~M`, etc.) is handled by a dedicated parsing strategy.

### Responsibilities

- Receive a tokenized record
- Validate fields according to the record specification
- Translate raw values into domain-level instructions

### Benefits

- New record types can be added without modifying existing parsers
- Strict vs lenient behavior can be implemented consistently
- Parsing logic remains isolated per record

---

## 2. Builder pattern — domain assembly

### Purpose

The Builder pattern is responsible for **constructing the domain model** incrementally during parsing.

The Builder acts as the single writer of domain entities.

### Responsibilities

- Create and register domain objects (Concepts, Measurements, Attachments, etc.)
- Resolve references between entities
- Assemble the final `BC3Document`

### Benefits

- Clear separation between parsing and object construction
- Parsing strategies do not depend on concrete domain implementations
- Enables validation and deferred resolution

---

## 3. Composite pattern — hierarchical structure

### Purpose

The Composite pattern models the **hierarchical nature** of BC3 data.

Chapters, subchapters, and items are represented uniformly as `Concept` nodes.

### Responsibilities

- Represent parent–child relationships
- Allow uniform traversal of chapters and items

### Benefits

- Consumers can treat single items and groups identically
- Hierarchy can be navigated, queried, or aggregated easily

---

## 4. Pattern interaction

```text
Tokenizer
  ↓
Dispatcher
  ↓
Strategy (per record type)
  ↓
Builder
  ↓
Composite domain tree (BC3Document)
```

### Interaction summary

- The **dispatcher** selects a Strategy based on record type
- The **Strategy** interprets raw data and delegates construction to the Builder
- The **Builder** creates domain objects and assembles the Composite hierarchy

---

## 5. Why this combination

| Concern             | Pattern   |
| ------------------- | --------- |
| Record variability  | Strategy  |
| Object construction | Builder   |
| Hierarchical data   | Composite |

This combination ensures:

- High extensibility
- Clear separation of concerns
- Incremental implementation without refactoring

---

## 6. Notes

- Domain models remain free of parsing logic
- Parsing strategies do not directly manipulate hierarchy
- The architecture supports future extensions (streaming, partial parsing)
