import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { BC3 } from '../../src/api/BC3.js';

const CORPUS_DIR = path.resolve('data/bc3-corpus/samples/real-world');

describe('Integration tests — real-world corpus', () => {
  const files = fs
    .readdirSync(CORPUS_DIR)
    .filter((f) => f.endsWith('.bc3') || f.endsWith('.BC3'));

  for (const file of files) {
    it(`parses ${file} without throwing`, () => {
      const filePath = path.join(CORPUS_DIR, file);
      const input = fs.readFileSync(filePath, 'latin1');

      const result = BC3.parse(input, { mode: 'lenient' });

      assert.ok(result.diagnostics.length >= 0);
      assert.ok(result.document !== undefined);

      const doc = result.document!;
      assert.ok(doc.roots.length >= 0);

      const summary = doc.getHierarchySummary();
      assert.equal(typeof summary.totalNodes, 'number');
      assert.equal(typeof summary.maxDepth, 'number');
      assert.equal(typeof summary.rootNodes, 'number');

      const errorDiagnostics = result.diagnostics.filter(
        (d) => d.level === 'error',
      );
      if (errorDiagnostics.length > 0) {
        console.warn(
          `  [${file}] ${errorDiagnostics.length} error(s), ${result.diagnostics.length} total diagnostics`,
        );
      }
    });
  }
});
