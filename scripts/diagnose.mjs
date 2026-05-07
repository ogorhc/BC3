import fs from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { BC3 } from '../dist/index.js';

const CORPUS_DIR = path.resolve('data/bc3-corpus/samples/real-world');

if (!existsSync(CORPUS_DIR)) {
  console.error(
    `Corpus directory not found: ${CORPUS_DIR}\n` +
      'Place .bc3 files in data/bc3-corpus/samples/real-world/',
  );
  process.exit(1);
}

const files = readdirSync(CORPUS_DIR).filter(
  (f) => f.endsWith('.bc3') || f.endsWith('.BC3'),
);

if (files.length === 0) {
  console.error('No .bc3 files found in corpus directory.');
  process.exit(1);
}

async function countRawTypes(raw) {
  const counts = {};
  const lines = raw.split('\n');
  for (const line of lines) {
    const m = line.match(/^~([A-Za-z])/);
    if (m) {
      const t = m[1].toUpperCase();
      counts[t] = (counts[t] ?? 0) + 1;
    }
  }
  return counts;
}

async function diagnoseFile(file) {
  const filePath = path.join(CORPUS_DIR, file);
  const input = await fs.readFile(filePath, 'latin1');
  const rawCounts = await countRawTypes(input);

  const { document, diagnostics } = BC3.parse(input, { mode: 'lenient' });

  const errors = diagnostics.filter((d) => d.level === 'error');
  const warns = diagnostics.filter((d) => d.level === 'warn');

  const diagByCode = {};
  for (const d of diagnostics) {
    const key = d.code ?? d.message;
    diagByCode[key] = (diagByCode[key] ?? 0) + 1;
  }

  const summary = document?.getHierarchySummary();

  return {
    file,
    size: input.length,
    rawCounts,
    diagCount: diagnostics.length,
    errorCount: errors.length,
    warnCount: warns.length,
    diagByCode,
    summary,
    metadata: document?.metadata ?? null,
    coefficients: document?.coefficients ?? null,
    entityCount: document?.entities?.size ?? 0,
    overrideCount: document?.costOverrides?.size ?? 0,
    attachmentCount: document?.attachments?.length ?? 0,
  };
}

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║        BC3 Corpus Diagnostic Report                  ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

const results = [];
for (const file of files) {
  process.stdout.write(`  Parsing ${file.slice(0, 50).padEnd(52)}... `);
  try {
    const r = await diagnoseFile(file);
    results.push(r);
    const status = r.errorCount > 0 ? '⚠ ERRORS' : '✓';
    console.log(
      `${status} (${r.summary?.totalNodes ?? 0} concepts, ${r.diagCount} diags)`,
    );
  } catch (err) {
    console.log(`✗ CRASH: ${err.message}`);
    results.push({ file, error: err.message });
  }
}

console.log('\n────────────────────────────────────────────────────\n');

// Per-file detail
for (const r of results) {
  if (r.error) {
    console.log(`✗ ${r.file}`);
    console.log(`  CRASH: ${r.error}\n`);
    continue;
  }

  const { summary } = r;
  console.log(`📄 ${r.file}`);
  console.log(`  Size: ${r.size.toLocaleString()} chars`);
  console.log(
    `  Version: ${r.metadata?.version || '-'} (${r.metadata?.versionDate || '-'})`,
  );
  console.log(`  Generator: ${r.metadata?.program || '-'}`);

  // Raw record counts
  const rawEntries = Object.entries(r.rawCounts).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  if (rawEntries.length > 0) {
    console.log(
      `  Raw records: ${rawEntries.map(([t, c]) => `~${t}=${c}`).join(', ')}`,
    );
  }

  // Hierarchy
  if (summary) {
    console.log(
      `  Tree: ${summary.totalNodes} concepts, ${summary.rootNodes} roots, depth ${summary.maxDepth}`,
    );
  }

  // Domain objects
  const parts = [];
  if (r.entityCount > 0) parts.push(`${r.entityCount} entities`);
  if (r.overrideCount > 0) parts.push(`${r.overrideCount} cost overrides`);
  if (r.attachmentCount > 0) parts.push(`${r.attachmentCount} attachments`);
  if (r.coefficients) {
    parts.push(
      `coefficients (${r.coefficients.legacy[0] ?? '-'} / ${r.coefficients.full[0] ?? '-'})`,
    );
  }
  if (parts.length > 0) console.log(`  Domain: ${parts.join(', ')}`);

  // Diagnostics
  if (r.diagCount > 0) {
    console.log(
      `  Diagnostics: ${r.diagCount} (${r.warnCount} warn, ${r.errorCount} error)`,
    );
    for (const [code, count] of Object.entries(r.diagByCode)) {
      console.log(`    ${code}: ${count}`);
    }
  } else {
    console.log(`  Diagnostics: 0`);
  }

  console.log();
}

// Summary table
console.log('────────────────────────────────────────────────────');
console.log('Total summary');
console.log('────────────────────────────────────────────────────\n');

const totalRaw = {};
let totalConcepts = 0;
let totalDiags = 0;
let totalErrors = 0;

for (const r of results) {
  if (r.error) continue;
  for (const [t, c] of Object.entries(r.rawCounts)) {
    totalRaw[t] = (totalRaw[t] ?? 0) + Number(c);
  }
  totalConcepts += r.summary?.totalNodes ?? 0;
  totalDiags += r.diagCount;
  totalErrors += r.errorCount;
}

const rawEntries = Object.entries(totalRaw).sort(([a], [b]) =>
  a.localeCompare(b),
);
console.log(
  `  Total raw records: ${rawEntries.map(([t, c]) => `~${t}=${c}`).join(', ')}`,
);
console.log(`  Total parsed concepts: ${totalConcepts}`);
console.log(`  Total diagnostics: ${totalDiags} (${totalErrors} errors)`);
console.log(`  Files parsed: ${results.filter((r) => !r.error).length}/${files.length}`);
