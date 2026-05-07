# Architecture

Documentation for the bc3 library's internal design — for contributors, reviewers, and AI agents.

## Documents

| File                                           | Contents                                               |
| ---------------------------------------------- | ------------------------------------------------------ |
| [overview.md](./overview.md)                   | High-level pipeline, module map, real folder structure |
| [module-boundaries.md](./module-boundaries.md) | Strict dependency rules between modules                |
| [design-patterns.md](./design-patterns.md)     | Strategy, Builder, Composite — how they interact       |

## Quick summary

```
BC3.parse(input)
  → StringImporter
    → Tokenizer          (~ record boundaries, | fields, \ subfields)
      → RecordDispatcher (routes ~X → XParser)
        → 14 strategy parsers
          → BC3ParseStore (intermediate)
            → DomainAssembler → BC3Document
```

Module dependency order (strict, no upward imports):

```
api → importers → parsing → builder → domain
                                    ↘ utils
```

See [module-boundaries.md](./module-boundaries.md) for the full rule set.
