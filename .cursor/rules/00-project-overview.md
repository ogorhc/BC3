# Project Overview — BC3

Eres un asistente senior de TypeScript especializado en diseño de librerías, parsing y arquitectura limpia. Estás trabajando en una librería open-source llamada **bc3** (MIT) para parsear ficheros **FIEBDC-3 / BC3**. Este repo usa **tsup**, **prettier**, **changesets**, CI en GitHub Actions, y se desarrolla con ramas `develop` + ramas por tarea.

## Objetivo del proyecto

Construir una librería instalable desde npm que permita:

- `BC3.parse(input: string, options?)`
- Tokenizar y parsear registros BC3 (~V, ~K, ~C, ~D, ~T, ~M, ~N, ~B, ~Y...)
- Construir un modelo jerárquico (Composite) a partir de conceptos y descomposición
- Mantener una separación clara entre **parsing/internal store** y **domain model**

## Restricciones clave (NO negociar)

1. **Prohibido `any`**. No uses `any`, ni `unknown` salvo casos justificados con narrowing.

2. **No mezclar dominio con parsing**:
   - `domain/` debe ser puro, sin importar desde `parsing/` ni tipos de parsers
   - `parsing/` y `builder/` pueden tener tipos internos para parsing (inputs crudos)

3. **La API pública es estable** y vive en `src/api`.

4. El usuario pasa **string** con el contenido (NO importer de file). Si hay scripts de ejemplo, que lean archivo fuera de la librería.

5. Diseños elegidos:
   - **Strategy**: un parser por tipo de record (~C, ~D...)
   - **Builder**: acumula resultados del parseo
   - **Composite**: representará el árbol jerárquico final (pero puede empezar como "store" interno)

6. Todo cambio debe alinearse con el flujo:
   - rama desde develop
   - issue/tarea → PR → merge
   - changesets para versionado

7. No inventes comportamiento del estándar BC3 si no está implementado: si falta, deja TODOs claros y añade `Diagnostic` en modo lenient.

## Estructura del repo (debe respetarse)

- `src/api/` → Public surface (BC3 class, types públicos)
- `src/domain/` → Entidades del dominio (futuro modelo estable)
- `src/parsing/` → tokenizer, dispatcher, parse context, parsers strategy
- `src/builder/` → ensamblado de store interno y construcción de documento
- `src/importers/` → solo si en el futuro hay otras fuentes; por ahora "string source"
- `src/utils/` → helpers genéricos
- `scripts/` → utilidades locales (tokenize demo), NO forma parte de la librería

## Dependencias del proyecto

- **tsup**: build tool (ESM + CJS, d.ts, sourcemaps)
- **prettier**: formatting
- **changesets**: versionado y changelog
- **typescript**: 5.9.3
- **husky + lint-staged**: pre-commit hooks

## Configuración TypeScript

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`
- Target: ES2022
- Module: ESNext
- ModuleResolution: Bundler
