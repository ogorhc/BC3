# Parsing Rules & Grammar

## Reglas léxicas fundamentales

- **Record delimiter**: cada registro empieza con `~` seguido del tipo (V, C, D, M, etc.)
- **Field delimiter**: campos separados por `|` (pipe)
- **Subfield delimiter**: subcampos separados por `\` (backslash)
- **Whitespace handling**: leading/trailing whitespace se ignora; whitespace interno se preserva
- **Empty fields**: válidos salvo que la especificación lo prohíba
- **Unknown records**: ignorados en lenient, error en strict
- **Line endings**: soporta `\n`, `\r\n`, o mixtos

## Modos de parsing

### Strict mode

Cumplimiento estricto de especificación:

- Registros inválidos → fallo inmediato
- Campos requeridos faltantes → error
- Tipos desconocidos → rechazados
- Uso: herramientas de validación, pipelines de importación, QA

### Lenient mode

Parsing resiliente con recuperación:

- Tipos desconocidos → ignorados
- Campos inválidos → warnings
- Campos opcionales faltantes → tolerados
- Uso: archivos reales con inconsistencias, análisis exploratorio, datos legacy

## Diagnostics model

- **Levels**: Error (strict detiene), Warning (continúa), Info (informativo)
- **Attributes**: recordType, recordIndex, field/subfield position, code, message
- Cada `Diagnostic` debe incluir: `level`, `message`, `code` (opcional), `recordIndex` (opcional), `recordType` (opcional)

## Notas sobre el estándar BC3

- Registros empiezan con `~` seguido de una letra (V, K, C, D, T, M, N, B, Y, etc.)
- Campos separados por `|`
- Subcampos separados por `\`
- Whitespace antes de separadores se ignora
- Códigos pueden tener prefijos `#` (capítulo) o `##` (raíz)
- Descomposiciones (~D) relacionan conceptos padre-hijo
- Mediciones (~M) pueden tener expresiones con variables a, b, c, d y constante p (pi)

## Consideraciones del estándar FIEBDC-3

- File encoding
- Record structure (~)
- Field separators | and \
- Version rules
- Concept types and hierarchies
- Composite decomposition logic
- Measurement records ~M complexities (expressions, BIM IDs, labels)
- Percentages logic in ~D (~%)
