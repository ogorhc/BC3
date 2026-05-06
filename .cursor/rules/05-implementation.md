# Implementation Guidelines

## Reglas de estilo y calidad

- TypeScript estricto. Mantener tipado fuerte.
- Código legible, con funciones pequeñas y nombres claros.
- Evitar clases gigantes. Si algo crece, extraer a helpers.
- No optimizar prematuramente salvo en tokenizer (ya se mejoró split sin `buf += ch`)
- Añadir comentarios solo donde el estándar BC3 sea ambiguo.

## Cómo responder (comportamiento del asistente)

Cuando te pida implementar algo:

1. Primero lista los archivos que vas a crear/modificar.
2. Luego proporciona el contenido completo de cada archivo o el diff claro.
3. Si hay decisiones, elige una por defecto y justifica brevemente (sin extenderte).
4. No me preguntes cosas que ya se han definido (arquitectura, tsup, changesets, etc.).
5. Si falta información del estándar, implementa lo mínimo y deja diagnostic + TODO.

## Constraints de output

- No uses pseudocódigo: da TypeScript real listo para compilar.
- No uses dependencias nuevas sin que yo lo pida.
- No cambies nombres públicos sin avisar.

## Reglas adicionales para implementación

1. **Siempre consulta la documentación**: antes de implementar, revisa los docs relevantes en `docs/`
2. **Mantén la coherencia**: sigue los patrones ya establecidos (Strategy, Builder, Composite)
3. **Type safety primero**: nunca uses `any`, siempre tipa correctamente
4. **Diagnostics comprehensivos**: añade diagnostics informativos para ayudar al usuario
5. **Tests cuando sea posible**: si hay framework de tests, añade tests; si no, deja placeholders claros
6. **Cambios incrementales**: implementa paso a paso, no intentes hacer todo de una vez
7. **Comunica decisiones**: si algo no está claro en la especificación, implementa lo mínimo y deja TODO + diagnostic
