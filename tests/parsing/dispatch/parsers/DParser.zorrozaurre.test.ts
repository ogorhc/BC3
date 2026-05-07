/**
 * Regression tests for the Zorrozaurre hierarchy bug.
 *
 * The Zorrozaurre file (PRESUPUESTO BC3_ZORROZAURRE.bc3, Presto 8.7,
 * FIEBDC-3/2002) exposes two bugs in looksLikeChildCode():
 *
 * Bug A: pure-numeric chapter codes like "2.2" match /^\d+(\.\d+)?$/ and
 *        are rejected as child codes → misclassified as percentageCodes.
 *
 * Bug B: pure-numeric performance values like "6990" match /^[0-9]{4,}$/ →
 *        treated as child codes, corrupting the decomposition triplets.
 *
 * These tests are written from the known-good ilovebc3 CSV export.
 *
 * BC3 code storage convention (as implemented in the library):
 *   ~C records use trailing '#' for chapter-type codes (e.g. "2#", "2.1#").
 *   Stored keys strip the trailing '#': "2#" → "2", "2.1#" → "2.1".
 *   ~D records reference child codes WITHOUT trailing '#'.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BC3 } from '../../../../src/api/BC3.js';

// ---------------------------------------------------------------------------
// Fixture A: parent "2" has 3 children using pure-numeric dotted codes.
// Mirrors the actual ~D|2#|2.1\1\1\2.2\1\1\... in Zorrozaurre.
// Before the fix: 2.2 and 2.3 are misclassified as percentageCodes of 2.1.
// ---------------------------------------------------------------------------
const PRESTO_DOTTED_CHAPTERS = [
  '~V|ZOR|FIEBDC-3/2002|||',
  '~C|2#||PRESUPUESTO|||0|',
  '~C|2.1#||Capítulo 1|||0|',
  '~C|2.2#||Capítulo 2|||0|',
  '~C|2.3#||Capítulo 3|||0|',
  // Child codes in ~D match ~C keys WITHOUT trailing '#'.
  // "2.1#" in ~C is stored as "2.1"; ~D references it as "2.1".
  '~D|2#|2.1\\1\\1\\2.2\\1\\1\\2.3\\1\\1\\|',
].join('\r\n');

// ---------------------------------------------------------------------------
// Fixture B: parent "2.1" has children with large integer performance values.
// Mirrors ~D|2.1#|URG0100001\1\6990\EDA0300013\1\1173\ in Zorrozaurre.
// Before the fix: "6990" is misclassified as a child code (old Rule A: 4+
// digit numbers).
// ---------------------------------------------------------------------------
const PRESTO_LARGE_PERFORMANCE = [
  '~V|ZOR|FIEBDC-3/2002|||',
  '~C|2.1#||Capítulo 1|||0|',
  '~C|URG0100001||Urgent work A|||1|',
  '~C|EDA0300013||Equipment A|||3|',
  // performance values 6990 and 1173 are quantities, NOT concept codes
  '~D|2.1#|URG0100001\\1\\6990\\EDA0300013\\1\\1173\\|',
].join('\r\n');

// ---------------------------------------------------------------------------
// Fixture C: full Zorrozaurre-like tree. Expected: 1 root ("2").
// Before the fix: 44 roots produced instead of 1.
// ---------------------------------------------------------------------------
const PRESTO_FULL_TREE = [
  '~V|ZOR|FIEBDC-3/2002|||',
  '~C|2#||PRESUPUESTO|||0|',
  '~C|2.1#||Cap 1|||0|',
  '~C|2.2#||Cap 2|||0|',
  '~C|2.3#||Cap 3|||0|',
  '~C|2.10#||Cap 10|||0|',
  '~C|2.18#||Cap 18|||0|',
  '~C|URG0100001||Child A|||1|',
  '~C|EDA0300013||Child B|||3|',
  '~D|2#|2.1\\1\\1\\2.2\\1\\1\\2.3\\1\\1\\2.10\\1\\1\\2.18\\1\\1\\|',
  '~D|2.1#|URG0100001\\1\\6990\\EDA0300013\\1\\1173\\|',
].join('\r\n');

// ---------------------------------------------------------------------------

describe('DParser — Presto 8.7 / Zorrozaurre regression', () => {
  // ---- Fixture A: pure-numeric dotted child codes -------------------------

  describe('pure-numeric dotted chapter codes (e.g. 2.2, 2.10)', () => {
    it('recognises all three chapters as children of 2', () => {
      const result = BC3.parse(PRESTO_DOTTED_CHAPTERS, { mode: 'lenient' });
      assert.ok(result.document);

      // "2#" in ~C is stored as "2" (trailing # stripped)
      const root = result.document.getConcept('2');
      assert.ok(root, 'concept "2" not found');
      assert.equal(
        root.decompositions.length,
        3,
        `expected 3 decompositions, got ${root.decompositions.length}`,
      );
    });

    it('child codes are 2.1, 2.2, 2.3 — in order', () => {
      const result = BC3.parse(PRESTO_DOTTED_CHAPTERS, { mode: 'lenient' });
      assert.ok(result.document);

      const root = result.document.getConcept('2');
      assert.ok(root);

      const codes = root.decompositions.map((d) => d.childCode);
      assert.deepEqual(codes, ['2.1', '2.2', '2.3']);
    });

    it('2.2 is NOT in percentageCodes of 2.1', () => {
      const result = BC3.parse(PRESTO_DOTTED_CHAPTERS, { mode: 'lenient' });
      assert.ok(result.document);

      const root = result.document.getConcept('2');
      assert.ok(root);

      // The first decomposition targets child 2.1; its percentageCodes must be empty
      const first = root.decompositions[0]!;
      assert.equal(first.childCode, '2.1');
      assert.deepEqual(first.percentageCodes ?? [], []);
    });

    it('each chapter has factor=1 and performance=1', () => {
      const result = BC3.parse(PRESTO_DOTTED_CHAPTERS, { mode: 'lenient' });
      assert.ok(result.document);

      const root = result.document.getConcept('2');
      assert.ok(root);

      for (const d of root.decompositions) {
        assert.equal(d.factor, 1);
        assert.equal(d.performance, 1);
      }
    });

    it('produces no diagnostics', () => {
      const result = BC3.parse(PRESTO_DOTTED_CHAPTERS, { mode: 'lenient' });
      assert.equal(
        result.diagnostics.length,
        0,
        `unexpected diagnostics: ${JSON.stringify(result.diagnostics)}`,
      );
    });
  });

  // ---- Fixture B: large integer performance values -----------------------

  describe('large integer performance values (e.g. 6990, 1173)', () => {
    it('recognises both children of 2.1', () => {
      const result = BC3.parse(PRESTO_LARGE_PERFORMANCE, { mode: 'lenient' });
      assert.ok(result.document);

      // "2.1#" → stored as "2.1"
      const cap1 = result.document.getConcept('2.1');
      assert.ok(cap1, 'concept "2.1" not found');
      assert.equal(
        cap1.decompositions.length,
        2,
        `expected 2 decompositions, got ${cap1.decompositions.length}`,
      );
    });

    it('child codes are URG0100001 and EDA0300013', () => {
      const result = BC3.parse(PRESTO_LARGE_PERFORMANCE, { mode: 'lenient' });
      assert.ok(result.document);

      const cap1 = result.document.getConcept('2.1');
      assert.ok(cap1);

      const codes = cap1.decompositions.map((d) => d.childCode);
      assert.deepEqual(codes, ['URG0100001', 'EDA0300013']);
    });

    it('URG0100001 has performance 6990, NOT treated as a child code', () => {
      const result = BC3.parse(PRESTO_LARGE_PERFORMANCE, { mode: 'lenient' });
      assert.ok(result.document);

      const cap1 = result.document.getConcept('2.1');
      assert.ok(cap1);

      const first = cap1.decompositions[0]!;
      assert.equal(first.childCode, 'URG0100001');
      assert.equal(first.performance, 6990);
    });

    it('EDA0300013 has performance 1173', () => {
      const result = BC3.parse(PRESTO_LARGE_PERFORMANCE, { mode: 'lenient' });
      assert.ok(result.document);

      const cap1 = result.document.getConcept('2.1');
      assert.ok(cap1);

      const second = cap1.decompositions[1]!;
      assert.equal(second.childCode, 'EDA0300013');
      assert.equal(second.performance, 1173);
    });

    it('6990 does NOT produce BC3_D_MISSING_CHILD_CODE diagnostic', () => {
      const result = BC3.parse(PRESTO_LARGE_PERFORMANCE, { mode: 'lenient' });
      const suspicious = result.diagnostics.filter(
        (d) => d.code === 'BC3_D_MISSING_CHILD_CODE',
      );
      assert.equal(
        suspicious.length,
        0,
        `unexpected BC3_D_MISSING_CHILD_CODE: ${JSON.stringify(suspicious)}`,
      );
    });
  });

  // ---- Fixture C: rootCodes count ----------------------------------------

  describe('roots count', () => {
    it('produces exactly 1 root (the budget root "2")', () => {
      const result = BC3.parse(PRESTO_FULL_TREE, { mode: 'lenient' });
      assert.ok(result.document);

      const roots = result.document.roots;
      assert.equal(
        roots.length,
        1,
        `expected 1 root, got ${roots.length}: ${JSON.stringify(roots.map((r) => r.concept.code))}`,
      );
    });

    it('root concept code is "2#" (Presto single-# chapter code)', () => {
      const result = BC3.parse(PRESTO_FULL_TREE, { mode: 'lenient' });
      assert.ok(result.document);

      // ~C|2#| stores concept.code as "2#" (raw code preserved).
      // conceptsByCode map key is "2" (trailing # stripped for lookup).
      assert.equal(result.document.roots[0]!.concept.code, '2#');
    });

    it('2.1, 2.2, 2.10, 2.18 are children of 2, not roots', () => {
      const result = BC3.parse(PRESTO_FULL_TREE, { mode: 'lenient' });
      assert.ok(result.document);

      // concept.code retains the trailing '#' from ~C records
      const rootCodes = new Set(
        result.document.roots.map((r) => r.concept.code),
      );
      for (const code of ['2.1#', '2.2#', '2.3#', '2.10#', '2.18#']) {
        assert.ok(!rootCodes.has(code), `${code} should not be a root`);
      }
    });

    it('URG0100001 and EDA0300013 are not roots', () => {
      const result = BC3.parse(PRESTO_FULL_TREE, { mode: 'lenient' });
      assert.ok(result.document);

      const rootCodes = new Set(
        result.document.roots.map((r) => r.concept.code),
      );
      assert.ok(
        !rootCodes.has('URG0100001'),
        'URG0100001 should not be a root',
      );
      assert.ok(
        !rootCodes.has('EDA0300013'),
        'EDA0300013 should not be a root',
      );
    });
  });

  // ---- Non-regression: existing formats must not break -------------------

  describe('non-regression: ARQUIMEDES multiline format', () => {
    const MULTILINE = [
      '~V|TEST|FIEBDC-3/2020|Test|||1|||',
      '~C|QUISI_V02##||Root|||0|',
      '~C|CAP.01#||Chapter 1|||0|',
      '~C|CAP.02#||Chapter 2|||0|',
      '~C|CAP.03#||Chapter 3|||0|',
      '~D|QUISI_V02##',
      '|CAP.01#\\1',
      '\\CAP.02#\\1',
      '\\CAP.03#\\1',
      '\\||',
      '~T|QUISI_V02##|Root description|',
    ].join('\r\n');

    it('still parses all 3 children from multiline ~D', () => {
      const result = BC3.parse(MULTILINE, { mode: 'lenient' });
      assert.ok(result.document);
      assert.equal(result.diagnostics.length, 0);

      const root = result.document.getConcept('QUISI_V02#');
      assert.ok(root);
      assert.equal(root.decompositions.length, 3);

      const codes = root.decompositions.map((d) => d.childCode);
      assert.deepEqual(codes, ['CAP.01', 'CAP.02', 'CAP.03']);
    });
  });

  describe('non-regression: alphanumeric dotted codes', () => {
    const ALPHADOT = [
      '~V|BugRepro|FIEBDC-3/2020|||',
      '~C|ITEM.A|m2|Item with dot in code|30|250101|0|',
      '~C|WORKER.1a|h|Worker type A|20|250101|1|',
      '~C|WORKER2b|h|Worker type B|15|250101|1|',
      '~D|ITEM.A|WORKER.1a\\1\\0.5\\WORKER2b\\1\\0.3\\|',
    ].join('\r\n');

    it('still parses alphanumeric dotted child codes correctly', () => {
      const result = BC3.parse(ALPHADOT, { mode: 'lenient' });
      assert.ok(result.document);

      const item = result.document.getConcept('ITEM.A');
      assert.ok(item);
      assert.equal(item.decompositions.length, 2);

      assert.equal(item.decompositions[0]!.childCode, 'WORKER.1a');
      assert.equal(item.decompositions[0]!.performance, 0.5);

      assert.equal(item.decompositions[1]!.childCode, 'WORKER2b');
      assert.equal(item.decompositions[1]!.performance, 0.3);
    });
  });

  describe('non-regression: decimal performance values (0.76)', () => {
    const DECIMAL_PERF = [
      '~V|T|FIEBDC-3/2020|||',
      '~C|PAR||Parent|||0|',
      '~C|CH1||Child 1|||1|',
      '~C|CH2||Child 2|||1|',
      // 0.76 is a decimal performance, not a child code
      '~D|PAR|CH1\\1\\0.76\\CH2\\1\\0.76\\|',
    ].join('\r\n');

    it('treats 0.76 as performance, not a child code', () => {
      const result = BC3.parse(DECIMAL_PERF, { mode: 'lenient' });
      assert.ok(result.document);

      const par = result.document.getConcept('PAR');
      assert.ok(par);
      assert.equal(par.decompositions.length, 2);

      assert.equal(par.decompositions[0]!.childCode, 'CH1');
      assert.equal(par.decompositions[0]!.performance, 0.76);

      assert.equal(par.decompositions[1]!.childCode, 'CH2');
      assert.equal(par.decompositions[1]!.performance, 0.76);
    });
  });

  describe('non-regression: short numeric concept codes (e.g. 1001, 1002)', () => {
    const NUMERIC_CODES = [
      '~V|T|FIEBDC-3/2020|||',
      '~C|A||Parent|||0|',
      '~C|1001||Child 1|||1|',
      '~C|1002||Child 2|||1|',
      '~D|A|1001\\2\\1\\1002\\3\\1.5\\|',
    ].join('\r\n');

    it('parses short numeric concept codes as children', () => {
      const result = BC3.parse(NUMERIC_CODES, { mode: 'lenient' });
      assert.ok(result.document);

      const a = result.document.getConcept('A');
      assert.ok(a);
      assert.equal(a.decompositions.length, 2);

      assert.equal(a.decompositions[0]!.childCode, '1001');
      assert.equal(a.decompositions[0]!.factor, 2);
      assert.equal(a.decompositions[0]!.performance, 1);

      assert.equal(a.decompositions[1]!.childCode, '1002');
      assert.equal(a.decompositions[1]!.factor, 3);
      assert.equal(a.decompositions[1]!.performance, 1.5);
    });
  });
});
