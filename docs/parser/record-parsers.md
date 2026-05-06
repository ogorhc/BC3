# Record Parsers Reference

Each parser implements `RecordParser` (`src/parsing/dispatch/parsers/types/RecordParser.ts`):

```ts
interface RecordParser {
  readonly type: string; // single uppercase letter
  parse(record: RawRecord, ctx: ParseContext): void;
}
```

Parsers call `ctx.builder.onX(payload)` to write data into `BC3ParseStore`.
They push `Diagnostic` objects to `ctx.diagnostics` when fields are missing or malformed.

---

## ~V — Version / Metadata

**File:** `VParser.ts`

```
~V | PROPIEDAD | VERSION \ FECHA | PROGRAMA | CABECERA \ ROTULOS... | JUEGO | COMENTARIO | TIPO | NUMCERT | FECHACERT | URL_BASE |
```

| Field index | Subfield | Variable            | Notes                                                                                                                                                                                                   |
| ----------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0           | 0        | `property`          | Property code                                                                                                                                                                                           |
| 1           | 0        | `version`           | e.g. `FIEBDC-3/2020`                                                                                                                                                                                    |
| 1           | 1        | `versionDate`       | Date portion — **caveat**: ARQUIMEDES writes `FIEBDC-3/2020\20102025` using `\` as separator inside the version string; tokenizer splits this into `f[1][1]`, which accidentally gives the correct date |
| 2           | 0        | `program`           | Authoring program name                                                                                                                                                                                  |
| 3           | 0        | `header`            | File header/title                                                                                                                                                                                       |
| 3           | 1+       | `labels`            | Additional labels                                                                                                                                                                                       |
| 4           | 0        | `charset`           | Character set code (`850`, `437`, `ANSI`) — informational only; the library does not perform decoding                                                                                                   |
| 5           | 0        | `comment`           | Free comment                                                                                                                                                                                            |
| 6           | 0        | `infoType`          | Info type code `1`–`4`                                                                                                                                                                                  |
| 7           | 0        | `certificateNumber` |                                                                                                                                                                                                         |
| 8           | 0        | `certificateDate`   |                                                                                                                                                                                                         |
| 9           | 0        | `baseUrl`           |                                                                                                                                                                                                         |

**Diagnostics:** none (all fields optional).

---

## ~K — Cost Coefficients

**File:** `KParser.ts`

```
~K | { DN \ DD \ DI \ GG \ BI \ BAJA \ IVA \ DIVISA } | | { DRC \ DC \ ... \ DIVISA \ ... } |
```

Stored as raw subfield arrays (`legacy` = field 0, `full` = field 2).
Domain model for coefficients is minimal in the current implementation.

**Diagnostics:** none.

---

## ~C — Concept Definition

**File:** `CParser.ts`

```
~C | CODIGO { \ CODIGO } | UNIDAD | RESUMEN | { PRECIO \ } | { FECHA \ } | TIPO |
```

| Field | Variable   | Notes                                                |
| ----- | ---------- | ---------------------------------------------------- |
| 0     | `codes[]`  | First code is primary; additional codes are aliases  |
| 1     | `unit`     | Unit of measure; stored as `undefined` if empty      |
| 2     | `summary`  | Short description                                    |
| 3     | `prices[]` | One price per subfield (multi-currency / multi-date) |
| 4     | `dates[]`  | Corresponding dates                                  |
| 5     | `type`     | Numeric concept type string                          |

**Diagnostics:** `BC3_C_MISSING_CODE` (warn) if field 0 is empty.

---

## ~D — Decomposition (structured)

**File:** `DParser.ts`

```
~D | PADRE | { HIJO \ FACTOR \ RENDIMIENTO \ PORCENTAJES } |
```

Each group of 4 subfields in field 1 is one decomposition line.
`PORCENTAJES` may be a semicolon-separated string (`A;B;C`) or parsed into extra subfields.

**Known gap:** ARQUIMEDES emits multi-line `~D` records where continuation lines lack a `~` prefix — the tokenizer silently drops them. See `docs/bc3-knowledge/known-edge-cases.md`.

**Diagnostics:** `BC3_D_MISSING_PARENT` (warn) if field 0 is empty.

---

## ~T — Text

**File:** `TParser.ts`

```
~T | CODIGO | TEXTO |
```

Associates free text with a concept code. Stored on `ConceptNode.concept.text`.

**Diagnostics:** none (silently skips if code is empty).

---

## ~M — Measurement

**File:** `MParser.ts`

```
~M | [PADRE\]HIJO | { POSICION\ } | MEDICION_TOTAL | { TIPO \ COMENTARIO \ U \ L \ La \ A \ } | [ETIQUETA] |
```

Field 0 subfield 0 may encode `PADRE\HIJO` (parent/child) or just `HIJO`.

**Diagnostics:** `BC3_M_MISSING_CODE` (warn) if field 0 is empty.

---

## ~N — Notes / Measurement variant

**File:** `NParser.ts`

Same field structure as `~M`. Used by some exporters as a measurement variant.

**Diagnostics:** `BC3_N_MISSING_CODE` (warn) if field 0 is empty.

---

## ~B — Bibliographic / Code rename

**File:** `BParser.ts`

```
~B | CODIGO_CONCEPTO | CODIGO_NUEVO |
```

Silently skips if `CODIGO_CONCEPTO` is empty.

**Diagnostics:** none.

---

## ~Y — Layout / Decomposition variant

**File:** `YParser.ts`

```
~Y | PADRE | { HIJO \ FACTOR \ RENDIMIENTO } ... |
```

Similar to `~D` but uses remaining fields (index 1+) for lines rather than a single packed field.

**Diagnostics:** none (silently skips if parent is empty).

---

## ~L — Specification (Pliegos) Sections

**File:** `LParser.ts`

Two forms:

```
~L | | < CODIGO_SECCION \ ROTULO_SECCION > |                              ← dictionary
~L | CODIGO_CONCEPTO | { CODIGO_SECCION \ TEXTO \ RTF \ HTM } |           ← per-concept
```

Sections are parsed in groups of 5 subfields from field 1.

**Diagnostics:** none.

---

## ~X — IT Codes / BIM / LCA Parameters

**File:** `XParser.ts`

Two forms:

```
~X | | < CODIGO_IT \ DESCRIPCION_IT \ UM \ > |                            ← dictionary
~X | CODIGO_CONCEPTO | < CODIGO_IT \ VALOR_IT \ > |                       ← per-concept
```

Real-world TSL (Presto 25.00) files contain `~X` lines up to 27,598 characters with 300+ parameter pairs.

**Diagnostics:** none.

---

## ~E — Entity

**File:** `EParser.ts`

```
~E | CODIGO_ENTIDAD | RESUMEN | NOMBRE | { TIPO \ SUBNOMBRE \ DIRECCIÓN \ CP \ LOCALIDAD \ PROVINCIA \ PAIS \ { TELEFONO ; } \ { FAX ; } \ { PERSONA_CONTACTO ; } \ } | CIF \ WEB \ EMAIL |
```

**Diagnostics:** `BC3_E_MISSING_CODE` (warn) if entity code is empty.

---

## ~A — Thesaurus

**File:** `AParser.ts`

```
~A | CODIGO_CONCEPTO | < CLAVE_TESAURO \ > |
```

**Diagnostics:** `BC3_A_MISSING_CODE` (warn) if concept code is empty.

---

## Unknown record type fallback

**File:** `UnknownRecordParser.ts`

`RecordDispatcher` handles unknown types before reaching `UnknownRecordParser`:

- **Strict mode:** throws immediately.
- **Lenient mode:** pushes a `warn`-level `Diagnostic` (code `BC3_UNKNOWN_RECORD`) and skips the record.

`UnknownRecordParser` is registered as a last-resort fallback but is not normally reached.
