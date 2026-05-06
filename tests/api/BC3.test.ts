/**
 * Tests for the public BC3.parse() API.
 *
 * Uses real BC3 string fixtures — no mocks.
 * Covers both 'strict' and 'lenient' modes.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BC3 } from '../../src/api/BC3.js';

// ---------------------------------------------------------------------------
// Minimal valid BC3 fixture
// ---------------------------------------------------------------------------
const MINIMAL_BC3 = [
  '~V|OBRA|FIEBDC-3/2020|Test Program|Test Header|||1|||',
  '~C|CAPITULO01||Chapter One|||0|',
  '',
].join('\r\n');

// ---------------------------------------------------------------------------
// BC3 with a full hierarchy: chapter → unit → resource
// ---------------------------------------------------------------------------
const HIERARCHY_BC3 = [
  '~V|OBRA|FIEBDC-3/2020|TestProg|Header|||1|||',
  '~C|CAP01||Chapter|1000.00||0|',
  '~C|UNIT01||Unit of work|50.00||1|',
  '~C|RES01||Labour resource|20.00||0|',
  '~D|CAP01|UNIT01\\2\\1\\|',
  '~D|UNIT01|RES01\\1\\0.5\\|',
  '',
].join('\r\n');

// ---------------------------------------------------------------------------
// BC3 with a ~D record missing the parent code
// ---------------------------------------------------------------------------
const MISSING_PARENT_BC3 = ['~D||CHILD01\\1\\1\\|', ''].join('\r\n');

// ---------------------------------------------------------------------------
// BC3 with an unknown record type
// ---------------------------------------------------------------------------
const UNKNOWN_RECORD_BC3 = ['~Z|some|data|', ''].join('\r\n');

// ---------------------------------------------------------------------------
// Completely empty input
// ---------------------------------------------------------------------------
const EMPTY_BC3 = '';

// ---------------------------------------------------------------------------
// Input with only whitespace / blank lines
// ---------------------------------------------------------------------------
const WHITESPACE_BC3 = '   \r\n   \r\n';

describe('BC3.parse', () => {
  describe('return value shape', () => {
    it('always returns an object with diagnostics array', () => {
      const result = BC3.parse(EMPTY_BC3);
      assert.ok(Array.isArray(result.diagnostics));
    });

    it('returns a BC3Document on valid input', () => {
      const result = BC3.parse(MINIMAL_BC3);
      assert.ok(result.document !== undefined, 'document should be defined');
    });

    it('returns empty diagnostics for valid minimal input', () => {
      const result = BC3.parse(MINIMAL_BC3);
      assert.equal(result.diagnostics.length, 0);
    });
  });

  describe('empty / whitespace input', () => {
    it('handles empty string without throwing', () => {
      assert.doesNotThrow(() => BC3.parse(EMPTY_BC3));
    });

    it('handles whitespace-only string without throwing', () => {
      assert.doesNotThrow(() => BC3.parse(WHITESPACE_BC3));
    });

    it('returns empty roots for empty input', () => {
      const result = BC3.parse(EMPTY_BC3);
      // document may be undefined or have zero roots
      if (result.document) {
        assert.equal(result.document.roots.length, 0);
      }
    });
  });

  describe('metadata from ~V record', () => {
    it('parses version from ~V record', () => {
      const result = BC3.parse(MINIMAL_BC3);
      assert.ok(result.document);
      assert.equal(result.document.metadata?.version, 'FIEBDC-3/2020');
    });

    it('parses program from ~V record', () => {
      const result = BC3.parse(MINIMAL_BC3);
      assert.ok(result.document);
      assert.equal(result.document.metadata?.program, 'Test Program');
    });

    it('parses property from ~V record', () => {
      const result = BC3.parse(MINIMAL_BC3);
      assert.ok(result.document);
      assert.equal(result.document.metadata?.property, 'OBRA');
    });
  });

  describe('concept parsing from ~C records', () => {
    it('creates a concept node for each ~C record', () => {
      const result = BC3.parse(MINIMAL_BC3);
      assert.ok(result.document);
      assert.ok(result.document.conceptsByCode.size >= 1);
    });

    it('can look up a concept by its code', () => {
      const result = BC3.parse(MINIMAL_BC3);
      assert.ok(result.document);
      const node = result.document.getConcept('CAPITULO01');
      assert.ok(node !== undefined, 'concept CAPITULO01 should be found');
    });

    it('parses summary from ~C record', () => {
      const result = BC3.parse(MINIMAL_BC3);
      assert.ok(result.document);
      const node = result.document.getConcept('CAPITULO01');
      assert.ok(node);
      assert.equal(node.concept.summary, 'Chapter One');
    });
  });

  describe('hierarchy from ~D records', () => {
    it('builds parent-child relationships from ~D records', () => {
      const result = BC3.parse(HIERARCHY_BC3);
      assert.ok(result.document);
      const cap = result.document.getConcept('CAP01');
      assert.ok(cap, 'CAP01 should exist');
      assert.equal(cap.children.length, 1, 'CAP01 should have 1 child');
    });

    it('sets correct child code in decomposition', () => {
      const result = BC3.parse(HIERARCHY_BC3);
      assert.ok(result.document);
      const unit = result.document.getConcept('UNIT01');
      assert.ok(unit, 'UNIT01 should exist');
      const decomp = result.document.getDecompositionInfo('CAP01', 'UNIT01');
      assert.ok(
        decomp !== undefined,
        'decomposition CAP01→UNIT01 should exist',
      );
    });

    it('emits a warning for ~D without parent code (lenient)', () => {
      const result = BC3.parse(MISSING_PARENT_BC3, { mode: 'lenient' });
      const warn = result.diagnostics.find(
        (d) => d.code === 'BC3_D_MISSING_PARENT',
      );
      assert.ok(warn, 'should emit BC3_D_MISSING_PARENT warning');
    });
  });

  describe('unknown record types', () => {
    it('does not throw for unknown record type in lenient mode', () => {
      assert.doesNotThrow(() =>
        BC3.parse(UNKNOWN_RECORD_BC3, { mode: 'lenient' }),
      );
    });

    it('does not add error for unknown record type in lenient mode', () => {
      const result = BC3.parse(UNKNOWN_RECORD_BC3, { mode: 'lenient' });
      const errors = result.diagnostics.filter((d) => d.level === 'error');
      assert.equal(errors.length, 0);
    });

    it('throws for unknown record type in strict mode', () => {
      // RecordDispatcher throws (does not collect a diagnostic) for unknown
      // record types in strict mode — this is the current documented behaviour.
      assert.throws(
        () => BC3.parse(UNKNOWN_RECORD_BC3, { mode: 'strict' }),
        /Unknown record type/,
      );
    });
  });

  describe('strict vs lenient mode', () => {
    it('defaults to lenient mode (no errors on unknown records)', () => {
      const result = BC3.parse(UNKNOWN_RECORD_BC3);
      const errors = result.diagnostics.filter((d) => d.level === 'error');
      assert.equal(errors.length, 0);
    });

    it('lenient mode still returns a document', () => {
      const result = BC3.parse(MINIMAL_BC3, { mode: 'lenient' });
      assert.ok(result.document);
    });

    it('strict mode still returns a document for clean input', () => {
      const result = BC3.parse(MINIMAL_BC3, { mode: 'strict' });
      assert.ok(result.document);
      assert.equal(result.diagnostics.length, 0);
    });
  });

  describe('EOF marker', () => {
    it('handles BC3 input with \\x1a EOF marker', () => {
      const input = MINIMAL_BC3 + '\x1a';
      assert.doesNotThrow(() => BC3.parse(input));
      const result = BC3.parse(input);
      assert.ok(result.document);
    });
  });

  describe('BC3Document methods', () => {
    it('roots contains top-level concepts', () => {
      const result = BC3.parse(HIERARCHY_BC3);
      assert.ok(result.document);
      assert.ok(result.document.roots.length > 0);
    });

    it('findConcepts returns matching concepts', () => {
      const result = BC3.parse(HIERARCHY_BC3);
      assert.ok(result.document);
      const found = result.document.findConcepts(
        (n) => n.concept.code === 'CAP01',
      );
      assert.equal(found.length, 1);
    });

    it('getHierarchySummary returns totalNodes count', () => {
      const result = BC3.parse(HIERARCHY_BC3);
      assert.ok(result.document);
      const summary = result.document.getHierarchySummary();
      assert.ok(summary.totalNodes >= 3, 'should have at least 3 concepts');
    });
  });
});
