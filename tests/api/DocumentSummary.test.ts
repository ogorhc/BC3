import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BC3 } from '../../src/api/BC3.js';
import { DocumentSummary } from '../../src/domain/types/RecordCounts.js';
import { summaryToString } from '../../src/utils/summaryToString.js';

const MINIMAL_BC3 = [
  '~V|T|FIEBDC-3/2020|Presto|||1|||',
  '~C|ROOT||Root concept|||0|',
  '~C|CH1||Child 1|10.5|250101|1|',
  '~C|CH2||Child 2|20.0|250101|1|',
  '~C|LEAF||Leaf concept|5.0|250101|3|',
  '~D|ROOT|CH1\\1\\2\\CH2\\1\\3\\|',
  '~D|CH1|LEAF\\1\\5\\|',
  '~M|LEAF|1\\|2.0\\||',
  '~T|ROOT|Root text description|',
  '~E|PROV01|Provider A|Company A||B12345678|www.test.com|info@test.com|',
].join('\r\n');

describe('BC3Document.getSummary()', () => {
  let summary: DocumentSummary;

  it('returns a summary with correct concept counts', () => {
    const result = BC3.parse(MINIMAL_BC3, { mode: 'lenient' });
    assert.ok(result.document);

    summary = result.document.getSummary();

    assert.equal(summary.totalConcepts, 4);
    assert.equal(summary.rootConcepts, 1);
    assert.equal(summary.leafConcepts, 2);
    assert.equal(summary.maxDepth, 2);
  });

  it('returns correct concept type distribution', () => {
    assert.equal(summary.conceptTypeDistribution.get(0), 1);
    assert.equal(summary.conceptTypeDistribution.get(1), 2);
    assert.equal(summary.conceptTypeDistribution.get(3), 1);
  });

  it('returns correct record counts', () => {
    const rc = summary.recordCounts;
    assert.equal(rc.V, 1);
    assert.equal(rc.C, 4);
    assert.equal(rc.D, 2);
    assert.equal(rc.T, 1);
    assert.equal(rc.M, 1);
    assert.equal(rc.E, 1);
    assert.equal(rc.N, 0);
    assert.equal(rc.L, 0);
    assert.equal(rc.X, 0);
    assert.equal(rc.A, 0);
    assert.equal(rc.O, 0);
    assert.equal(rc.K, 0);
    assert.equal(rc.Y, 0);
    assert.equal(rc.G, 0);
    assert.equal(rc.unknown, 0);
  });

  it('returns correct measurement stats', () => {
    assert.equal(summary.conceptsWithMeasurements, 1);
    assert.equal(summary.totalMeasurementLines, 1);
  });

  it('returns correct decomposition stats', () => {
    // ROOT decomposes to CH1 and CH2 (2 lines), CH1 decomposes to LEAF (1 line) = 3
    assert.equal(summary.totalDecompositions, 3);
    // CH1 and ROOT have decompositions
    assert.equal(summary.conceptsWithDecompositions, 2);
  });

  it('returns correct entity count', () => {
    assert.equal(summary.entities, 1);
  });

  it('returns correct diagnostic counts', () => {
    assert.equal(summary.diagnostics.info, 0);
    assert.equal(summary.diagnostics.warn, 0);
    assert.equal(summary.diagnostics.error, 0);
  });

  it('returns metadata from ~V', () => {
    assert.ok(summary.metadata);
    assert.equal(summary.metadata!.version, 'FIEBDC-3/2020');
    assert.equal(summary.metadata!.program, 'Presto');
  });

  it('is cached — second call returns same object', () => {
    const result = BC3.parse(MINIMAL_BC3, { mode: 'lenient' });
    assert.ok(result.document);

    const s1 = result.document.getSummary();
    const s2 = result.document.getSummary();
    assert.equal(s1, s2);
  });

  it('returns empty counts for a file with no records', () => {
    const result = BC3.parse('', { mode: 'lenient' });
    assert.ok(result.document);

    const s = result.document.getSummary();
    assert.equal(s.totalConcepts, 0);
    assert.equal(s.totalDecompositions, 0);
    assert.deepEqual(s.conceptTypeDistribution, new Map());
  });

  it('counts unknown records', () => {
    const fixture = [
      '~V|T|FIEBDC-3/2020|||',
      '~C|A||Concept|||0|',
      '~Z|unknown field|',
    ].join('\r\n');
    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);

    const rc = result.document.getSummary().recordCounts;
    assert.equal(rc.unknown, 1);
  });
});

describe('summaryToString()', () => {
  it('formats a summary into a readable string', () => {
    const result = BC3.parse(MINIMAL_BC3, { mode: 'lenient' });
    assert.ok(result.document);

    const output = summaryToString(result.document.getSummary());

    assert.ok(output.includes('Version: FIEBDC-3/2020  Program: Presto'));
    assert.ok(output.includes('Records:'));
    assert.ok(output.includes('V:1'));
    assert.ok(output.includes('C:4'));
    assert.ok(output.includes('D:2'));
    assert.ok(output.includes('M:1'));
    assert.ok(output.includes('E:1'));
    assert.ok(
      output.includes('Concepts:  4 total  1 root  2 leaves  max depth: 2'),
    );
    assert.ok(output.includes('Type 0: 1  Type 1: 2  Type 3: 1'));
    assert.ok(output.includes('Measurements:  1 concepts  1 detail lines'));
    assert.ok(
      output.includes(
        'Decompositions:  3 links  2 concepts with decompositions',
      ),
    );
    assert.ok(output.includes('Entities:  1'));
    assert.ok(output.includes('Diagnostics:  0 info  0 warn  0 error'));
  });

  it('formats summary with no metadata', () => {
    const fixture = '~C|ROOT||Root|||0|';
    const result = BC3.parse(fixture, { mode: 'lenient' });
    const output = summaryToString(result.document!.getSummary());

    assert.ok(output.includes('Records:  V:0  C:1'));
    assert.ok(output.includes('Concepts:  1 total'));
  });

  it('formats summary with diagnostics', () => {
    const fixture = ['~C|A||Concept|||0|', '~Z|unknown|'].join('\r\n');
    const result = BC3.parse(fixture, { mode: 'lenient' });
    const output = summaryToString(result.document!.getSummary());

    assert.ok(output.includes('unknown:1'));
    assert.ok(output.includes('Diagnostics:  0 info  1 warn  0 error'));
  });
});
