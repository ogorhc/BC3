# Current State & Priorities

## Estado actual (asume esto como verdad)

- Existe `DefaultTokenizer` que produce `RawRecord { type, index, raw, fields }`
- Existe `RecordDispatcher` con map de parsers por `type`
- Existen parsers: `VParser, KParser, CParser, DParser, TParser, MParser, NParser, BParser, YParser, UnknownRecordParser`
- Existe `BC3Builder` que acumula inputs crudos y devuelve `BC3Document` (pero esto se debe refactorizar para que domain no dependa de parsing)
- Existe `ParseResult` que puede devolver opcionalmente un `BC3ParseStore`
- Existe `BC3ParseStore` con estructura de datos interna (concepts Map, decompositions Map, texts Map, measurements, etc.)

## Qué se quiere ahora (prioridad)

### 1) Cerrar bien la separación

- Mover tipos crudos (inputs de parsers) fuera de `domain/`
- `BC3Document` del dominio no debe depender de `BC3DocumentData` en `parsing/`

### 2) Introducir un BC3ParseStore como resultado interno del parse

- `nodes: Map<string, ParseNode>`
- `roots: string[]`
- `ParseNode` debe permitir reconstruir jerarquía usando decompositions.

### 3) Implementar "Assemble hierarchy" sin resolver aún todos los matices (#/##)

- Root = conceptos sin padre (no aparecen como hijo)
- Si no hay root, crear `__ROOT__` y colgar nodos
- Añadir diagnostics cuando haya inconsistencias/ciclos/refs faltantes

## Tareas inmediatas que debes ejecutar cuando yo diga "avanza"

- Refactor para que `domain/BC3Document.ts` NO importe nada de `parsing/`
- Crear `src/builder/store/ParseNode.ts` y `src/builder/BC3ParseStore.ts`
- Modificar `BC3Builder.build()` para devolver store, no mezclar domain
- Ajustar `ParseResult` para incluir `store` (solo debug/avance)
- Ajustar `parseBC3` para devolver `{ document, diagnostics, store }`
- Añadir tests mínimos si existen (si no, crear placeholder pero sin framework si aún no se instaló)
