# Usage Examples

## Parse a BC3 string

```typescript
import { BC3 } from 'bc3';

const bc3Text = [
  '~V|OBRA|FIEBDC-3/2020\\02102025|Presto 25.00|Cab|',
  '~C|CAP01||Chapter One|||0|',
  '~C|RES01|h|Labour Resource|20.00\\21.00\\22.00|20200101\\20210101\\20220101|0|',
  '~D|CAP01|RES01\\1\\2.5|',
].join('\r\n');

const result = BC3.parse(bc3Text, { mode: 'lenient' });

if (result.document) {
  console.log(`Concepts: ${result.document.conceptsByCode.size}`);
  console.log(`Diagnostics: ${result.diagnostics.length}`);
}
```

## Parse a Latin-1 encoded file (Node.js)

```typescript
import fs from 'node:fs';
import { BC3 } from 'bc3';

const input = fs.readFileSync('project.bc3', 'latin1');
const result = BC3.parse(input, { mode: 'lenient' });

for (const d of result.diagnostics) {
  console.log(`[${d.level}] ${d.code}: ${d.message}`);
}
```

## Inspect the hierarchy tree

```typescript
const doc = result.document!;

doc.walkTree((node, depth, path) => {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${node.concept.codeNorm} — ${node.concept.summary}`);
  console.log(`${indent}  depth=${depth}, path=${path.join(' > ')}`);
});
```

## Find concept occurrences

```typescript
const paths = doc.getAllPathsToConcept('001010');
paths.forEach((path, i) => {
  console.log(
    `Path ${i + 1}: ${path.map((n) => n.concept.codeNorm).join(' → ')}`,
  );
});
```

## Get decomposition information

```typescript
const decompInfo = doc.getDecompositionInfo('300100', '001010');
if (decompInfo) {
  const child = doc.getConcept('001010')!;
  const price = child.concept.prices.at(-1)!;
  console.log(`Amount: ${price * (decompInfo.performance ?? 0)}`);
}
```

## Access measurement partials

```typescript
const node = doc.getConcept('01');
if (node) {
  for (const measurement of node.measurements) {
    console.log(`Total: ${measurement.total}`);
    for (const detail of measurement.details) {
      console.log(
        `  ${detail.type} — partial: ${detail.partial}` +
          ` (${detail.length} × ${detail.latitude} × ${detail.height} × ${detail.units})`,
      );
    }
  }
}
```

## Access metadata and coefficients

```typescript
console.log('Version:', doc.metadata?.version);
console.log('Generator:', doc.metadata?.program);
console.log('Currency:', doc.coefficients?.legacy[0]);
```

## Access entities, cost overrides, and attachments

```typescript
for (const [code, entity] of doc.entities) {
  console.log(`${code}: ${entity.name ?? entity.summary}`);
}

for (const [code, override] of doc.costOverrides) {
  for (const loc of override.locations) {
    console.log(`${code} → ${loc.location}: ${loc.price}`);
  }
}

for (const att of doc.attachments) {
  console.log(`${att.conceptCode}: ${att.type} — ${att.url}`);
}
```
