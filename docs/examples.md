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

## Get a document summary

```typescript
import { BC3, summaryToString } from 'bc3';

const result = BC3.parse(bc3Text, { mode: 'lenient' });
const summary = result.document!.getSummary();

// Human-readable
console.log(summaryToString(summary));
// Version: FIEBDC-3/2020  Program: Presto 8.7
// Records:  V:1  C:973  D:405  T:781  M:770  E:0  A:79  K:1
// Concepts:  973 total  1 root  568 leaves  max depth: 7
//   Type 0: 622  Type 1: 7  Type 2: 55  Type 3: 289
// Measurements:  74 concepts  4481 detail lines
// Decompositions:  2473 links  405 concepts with decompositions
// Diagnostics:  0 info  0 warn  0 error

// Programmatic
console.log(summary.totalConcepts); // 973
console.log(summary.recordCounts.C); // 973
console.log(summary.conceptTypeDistribution); // Map(4) { 0→622, 1→7, 2→55, 3→289 }
```
