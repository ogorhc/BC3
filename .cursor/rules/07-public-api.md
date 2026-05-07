# Public API Contract

## API principal

```ts
BC3.parse(input: string | Uint8Array | ArrayBuffer, options?: BC3ParseOptions): BC3ParseResult
```

## Opciones

- `mode`: `'strict' | 'lenient'` (default: `'lenient'`)
- `charset`: `'auto' | 'ansi' | '850' | '437'` (default: `'auto'`)
- `collectRawRecords`: `boolean` (default: `false`)

## Return type: BC3ParseResult

- `document`: `BC3Document`
- `diagnostics`: `BC3Diagnostics`
- `stats` (optional): parse statistics

## Decisión sync/async

- Default: **sincrónico** (CPU-bound, no requiere IO)
- Opcional futuro: `BC3.parseAsync()` para streams o archivos grandes

## Extensibilidad futura

- `BC3.from(source, options?)` para soportar XML, DB, programático

## Export surface

El library debe exportar:

- `BC3` (main façade)
- Domain types: `BC3Document`, `Concept`, etc.
- Parse types: `BC3ParseOptions`, `BC3ParseResult`, `Diagnostic`

**NO exportar** (internal implementation details):

- token types
- parsing strategies
- builder internals
