# Architecture & Design Patterns

## Patrones implementados

### 1. Strategy Pattern (parsing behavior)

- Un parser por tipo de record (~V, ~C, ~D, etc.)
- Responsabilidades: recibir token, validar campos, traducir a instrucciones de dominio
- Beneficios: extensibilidad, comportamiento consistente strict/lenient, aislamiento

### 2. Builder Pattern (domain assembly)

- Construye el modelo de dominio incrementalmente
- Single writer de entidades de dominio
- Responsabilidades: crear/registrar objetos, resolver referencias, ensamblar BC3Document
- Beneficios: separación parsing/construcción, parsers no dependen de implementaciones concretas

### 3. Composite Pattern (hierarchical structure)

- Modela la naturaleza jerárquica de BC3
- Capítulos, subcapítulos, items representados uniformemente como `Concept` nodes
- Beneficios: tratamiento uniforme, navegación/consulta/agregación fácil

## Flujo de interacción

```
Tokenizer → Dispatcher → Strategy (per record type) → Builder → Composite domain tree (BC3Document)
```

## Arquitectura en capas

```
API
 ↓
Importer (source-specific)
 ↓
Tokenizer → Dispatcher → Strategy
 ↓
Builder
 ↓
Composite Domain Model (BC3Document)
```

## Estructura de carpetas propuesta

```
src/
  api/
    bc3.ts              # Public API façade (BC3.parse, BC3.from)
    types.ts            # Public options and return types

  importers/
    bc3-text/
      importer.ts       # BC3 text import orchestration
      options.ts        # Importer-specific options

  domain/
    document.ts         # BC3Document aggregate
    concept.ts          # Concept entity + hierarchy node
    decomposition.ts    # Decomposition entities
    measurement.ts      # Measurement entities
    attachments.ts      # Attachments / resources
    diagnostics.ts      # Diagnostics model

  parsing/
    tokenizer/
      tokenizer.ts      # Record and field tokenization
      tokens.ts         # Token definitions

    dispatcher/
      dispatcher.ts     # Strategy selection
      registry.ts       # Strategy registration

    strategies/
      v.parser.ts       # ~V
      k.parser.ts       # ~K
      c.parser.ts       # ~C
      d.parser.ts       # ~D
      m.parser.ts       # ~M

    context/
      parse-context.ts  # Shared parsing state

  builder/
    builder.ts          # Domain construction orchestrator
    hierarchy.ts       # Composite hierarchy helpers
    resolvers.ts       # Deferred reference resolution

  utils/
    strings.ts
    numbers.ts
    dates.ts
    charset.ts
```

## Reglas de dependencias

**Permitidas**:

- `api` → `importers`, `domain`
- `importers` → `parsing`, `builder`, `domain`, `utils`
- `parsing` → `builder`, `domain`, `utils`
- `builder` → `domain`, `utils`
- `domain` → (none)
- `utils` → (none)

**Prohibidas**:

- `domain` importando `parsing`, `builder`, o `importers`
- `utils` importando `domain`
- `parsing` importando `api`

## Responsabilidades de módulos

- **api/**: superficie pública estable; selecciona el importer apropiado
- **importers/**: workflows específicos de fuente que adaptan inputs a operaciones del Builder
- **domain/**: entidades de dominio puras e invariantes
- **parsing/**: tokenizer, dispatcher, strategies, y contexto de parsing
- **builder/**: ensamblado de dominio y construcción de jerarquía
- **utils/**: helpers genéricos sin dependencia de dominio
