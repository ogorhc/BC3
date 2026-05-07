# Domain Model

## Entidades del dominio (independientes de parsing)

### BC3Document

Agregado raíz con metadata, concepts, hierarchy, diagnostics.

### Record

Representación abstracta de un registro `~X`.

### Concept

Concepto BC3 (unidad, capítulo, item) con códigos, unidad, precios, fechas, texto.

### Decomposition

Descomposición de concepto en sub-conceptos con relaciones padre-hijo.

### Measurement

Datos de medición con cantidades, expresiones, subtotales.

### Attachments

Recursos externos (documentos, gráficos, BIM).

## Relaciones

```
BC3Document
 ├─ Concepts
 │   ├─ Concept
 │   │   ├─ Decompositions
 │   │   │   └─ Concept
 │   │   └─ Measurements
 │   └─ Attachments
 └─ Diagnostics
```

## Notas importantes

- Domain models deben no depender de parsing o IO logic
- Parsing strategies pueblan estos modelos vía Builder
- Este modelo está diseñado para evolucionar incrementalmente conforme crece el soporte de records
