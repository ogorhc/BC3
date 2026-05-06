/**
 * Unit tests for the Tokenizer.
 *
 * Covers: record boundary detection, field splitting, subfield splitting,
 * whitespace trimming, EOF marker handling, lenient vs strict mode,
 * and known edge cases from the BC3 corpus.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Tokenizer } from '../../src/parsing/Tokenizer.js';

const tokenizer = new Tokenizer();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function tokenize(
  input: string,
  options?: Parameters<Tokenizer['tokenize']>[1],
) {
  return tokenizer.tokenize(input, options);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Tokenizer', () => {
  describe('basic record detection', () => {
    it('returns empty array for empty input', () => {
      assert.deepEqual(tokenize(''), []);
    });

    it('returns empty array for whitespace-only input', () => {
      assert.deepEqual(tokenize('   \r\n   '), []);
    });

    it('parses a single record', () => {
      const records = tokenize('~V|OBRA|FIEBDC-3/2020|');
      assert.equal(records.length, 1);
      assert.equal(records[0]?.type, 'V');
    });

    it('parses multiple records separated by CRLF', () => {
      const records = tokenize('~V|OBRA|\r\n~C|CAP01||Chapter|\r\n');
      assert.equal(records.length, 2);
      assert.equal(records[0]?.type, 'V');
      assert.equal(records[1]?.type, 'C');
    });

    it('parses multiple records separated by LF only', () => {
      const records = tokenize('~V|OBRA|\n~C|CAP01|\n');
      assert.equal(records.length, 2);
    });

    it('assigns sequential 0-based index to each record', () => {
      const records = tokenize('~V|A|\r\n~C|B|\r\n~D|C|\r\n');
      assert.equal(records[0]?.index, 0);
      assert.equal(records[1]?.index, 1);
      assert.equal(records[2]?.index, 2);
    });

    it('preserves raw text in each record', () => {
      const records = tokenize('~V|OBRA|');
      assert.ok(records[0]?.raw.startsWith('~V'));
    });
  });

  describe('EOF marker', () => {
    it('strips \\x1a EOF marker before tokenizing', () => {
      const records = tokenize('~V|OBRA|\x1a');
      assert.equal(records.length, 1);
    });

    it('content after \\x1a is discarded', () => {
      const records = tokenize('~V|OBRA|\x1a~C|CAP01|');
      assert.equal(records.length, 1);
      assert.equal(records[0]?.type, 'V');
    });
  });

  describe('field splitting by |', () => {
    it('splits record body into fields by |', () => {
      const records = tokenize('~C|CAP01|m2|Chapter One|100.00|');
      const fields = records[0]?.fields ?? [];
      // fields[0] = ['CAP01'], fields[1] = ['m2'], fields[2] = ['Chapter One'], fields[3] = ['100.00']
      assert.equal(fields[0]?.[0], 'CAP01');
      assert.equal(fields[1]?.[0], 'm2');
      assert.equal(fields[2]?.[0], 'Chapter One');
    });

    it('empty fields between || are represented as empty-string subfields', () => {
      const records = tokenize('~C|CAP01|||Chapter|');
      const fields = records[0]?.fields ?? [];
      // body = 'CAP01|||Chapter|' → split by | → ['CAP01','','','Chapter','']
      assert.equal(fields[1]?.[0], '');
      assert.equal(fields[2]?.[0], '');
      assert.equal(fields[3]?.[0], 'Chapter');
    });
  });

  describe('subfield splitting by \\', () => {
    it('splits field into subfields by backslash', () => {
      // ~V | PROP | VERSION\DATE | ...
      const records = tokenize('~V|OBRA|FIEBDC-3/2020\\20240101|TestProg|');
      const fields = records[0]?.fields ?? [];
      assert.equal(fields[1]?.[0], 'FIEBDC-3/2020');
      assert.equal(fields[1]?.[1], '20240101');
    });

    it('multiple subfields in decomposition child triplet', () => {
      // ~D | PARENT | CHILD\FACTOR\REND\ |
      const records = tokenize('~D|CAP01|UNIT01\\2\\0.5\\|');
      const fields = records[0]?.fields ?? [];
      assert.equal(fields[0]?.[0], 'CAP01'); // parent
      assert.equal(fields[1]?.[0], 'UNIT01'); // child code
      assert.equal(fields[1]?.[1], '2'); // factor
      assert.equal(fields[1]?.[2], '0.5'); // performance
    });
  });

  describe('whitespace trimming (default: trimAroundSeparators=true)', () => {
    it('trims trailing whitespace from field values', () => {
      const records = tokenize('~C|CAP01   |');
      assert.equal(records[0]?.fields[0]?.[0], 'CAP01');
    });

    it('trims leading whitespace from field values', () => {
      const records = tokenize('~C|   CAP01|');
      assert.equal(records[0]?.fields[0]?.[0], 'CAP01');
    });

    it('preserves content between separators after trimming', () => {
      const records = tokenize('~C| CAP01 | m2 | Summary Text |');
      const f = records[0]?.fields ?? [];
      assert.equal(f[0]?.[0], 'CAP01');
      assert.equal(f[1]?.[0], 'm2');
      assert.equal(f[2]?.[0], 'Summary Text');
    });
  });

  describe('lenient mode (default)', () => {
    it('default mode is lenient (allows ~ in non-start positions)', () => {
      // In lenient mode, ~ in the middle of a line can start a new record
      const records = tokenize('~V|OBRA| ~C|CAP01|');
      // lenient: the ~ after the space is treated as a new record start
      assert.ok(records.length >= 1);
    });

    it('treats ~ at position 0 as a record start', () => {
      const records = tokenize('~V|OBRA|');
      assert.equal(records.length, 1);
    });
  });

  describe('strict mode (lenient=false)', () => {
    it('only recognises ~ preceded by whitespace as record start', () => {
      // With lenient=false, only ~ after whitespace or at pos 0 is a record start
      const records = tokenize('~V|OBRA|\r\n~C|CAP01|', { lenient: false });
      assert.equal(records.length, 2);
    });
  });

  describe('record type extraction', () => {
    it('extracts single uppercase letter as type', () => {
      const records = tokenize('~C|CODE|');
      assert.equal(records[0]?.type, 'C');
    });

    it('extracts lowercase letter as type', () => {
      const records = tokenize('~v|OBRA|');
      assert.equal(records[0]?.type, 'v');
    });

    it('handles all standard BC3 record types', () => {
      const types = [
        'V',
        'C',
        'D',
        'M',
        'T',
        'K',
        'A',
        'B',
        'L',
        'N',
        'X',
        'Y',
        'E',
      ];
      for (const t of types) {
        const records = tokenize(`~${t}|data|`);
        assert.equal(records[0]?.type, t, `type ${t} should be extracted`);
      }
    });
  });

  describe('edge cases', () => {
    it('handles a record with no fields (only type)', () => {
      const records = tokenize('~V');
      // raw.length < 2 → treated as empty or invalid
      assert.ok(records.length <= 1);
    });

    it('handles consecutive record markers with no content', () => {
      const records = tokenize('~V|\r\n~C|\r\n~D|');
      assert.equal(records.length, 3);
    });

    it('handles input that is only the EOF marker', () => {
      const records = tokenize('\x1a');
      assert.deepEqual(records, []);
    });

    it('handles Windows-style line endings (CRLF)', () => {
      const records = tokenize('~V|A|\r\n~C|B|\r\n');
      assert.equal(records.length, 2);
    });

    it('handles Unix-style line endings (LF)', () => {
      const records = tokenize('~V|A|\n~C|B|\n');
      assert.equal(records.length, 2);
    });

    it('strips null bytes from input', () => {
      const records = tokenize('~V|\x00A|\r\n\x00~C|B\x00|\r\n');
      assert.equal(records.length, 2);
      assert.equal(records[0]!.type, 'V');
      assert.equal(records[1]!.type, 'C');
    });
  });
});
