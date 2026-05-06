# Workflow & GitHub Projects

## Flujo de trabajo

1. Desarrollo en rama `develop`
2. Cada tarea → rama desde `develop` → PR → merge a `develop`
3. Releases: `develop` → `main` con changesets
4. CI: GitHub Actions ejecuta `npm ci` y `npm run ci` en pushes/PRs

## Release Process

### Desarrollo diario

1. Crear rama desde `develop`: `feature/<issue>-<short-name>` o `chore/<issue>-<short-name>`
2. Hacer cambios y commit
3. Añadir changeset: `npm run changeset`
4. Commit del archivo generado en `.changeset/`
5. Push y abrir PR a `develop` con `Closes #<issue>` en la descripción

### Release a npm

1. Crear release branch desde `develop`: `release/vX.Y.Z`
2. Aplicar versiones: `npm run version-packages` (actualiza package.json, CHANGELOG.md, elimina .changeset/\*)
3. Push release branch y abrir PR a `main`
4. Merge PR a `main`
5. Publishing automático vía GitHub Actions en push a `main`

**Notas**:

- El tipo de bump (patch/minor/major) se elige al ejecutar `npm run changeset`
- `changeset version` solo se ejecuta en release branch, nunca en CI
- CI solo build/test/format; publishing lo maneja el workflow de release en `main`

## Fases del proyecto

El proyecto está organizado en fases:

- **Phase 0**: Setup (completado)
- **Phase 1**: Architecture & Public API (completado)
- **Phase 2**: Parsing pipeline foundation (completado)
- **Phase 3**: Core records (MVP) ← **ESTAMOS AQUÍ**
- **Phase 4**: Measurements & BIM linkage
- **Phase 5**: Extended records & attachments
- **Phase 6**: Validation & performance
- **Phase 7**: Testing & releases

## Tareas prioritarias de Phase 3

1. Parse ~V (Version/Metadata) - Backlog
2. Parse ~K (Decimals/Coefficients) - Backlog
3. Parse ~C (Concept) - Backlog
4. Parse ~T (Text) - Backlog
5. Parse ~D (Decomposition) - Backlog
6. Handle code normalization (#/##) - Backlog
7. **Assemble hierarchy (chapters/items)** - Backlog ← **PRÓXIMA PRIORIDAD**

## Lista completa de tareas por fase

**Phase 0 - Setup**: Completado
**Phase 1 - Architecture & Public API**: Completado
**Phase 2 - Parsing pipeline foundation**: Completado
**Phase 3 - Core records (MVP)**: En progreso

- Parse ~V (Version/Metadata) - Backlog
- Parse ~K (Decimals/Coefficients) - Backlog
- Parse ~C (Concept) - Backlog
- Parse ~T (Text) - Backlog
- Parse ~D (Decomposition) - Backlog
- Handle code normalization (#/##) - Backlog
- Assemble hierarchy (chapters/items) - Backlog ← PRÓXIMA PRIORIDAD

**Phase 4 - Measurements & BIM linkage**: Pendiente
**Phase 5 - Extended records & attachments**: Pendiente
**Phase 6 - Validation & performance**: Pendiente
**Phase 7 - Testing & releases**: Pendiente

## Trabajo con tareas de GitHub Projects

Cuando trabajes en una tarea específica:

1. **Identifica la fase y prioridad**: consulta la lista de tareas para entender el contexto
2. **Sigue el flujo de trabajo**: rama desde `develop`, cambios, changeset, PR
3. **Respeta las dependencias**: no implementes tareas de fases futuras hasta que las anteriores estén completas
4. **Mantén la separación de módulos**: sigue las reglas de dependencias estrictamente
5. **Añade diagnostics**: cuando encuentres casos edge o comportamientos no especificados
6. **Documenta decisiones**: si tomas una decisión arquitectónica, justifícala brevemente
