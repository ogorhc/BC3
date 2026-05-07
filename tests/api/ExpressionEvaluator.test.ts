import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BC3 } from '../../src/api/BC3.js';

describe('Measurement expression evaluation (integration)', () => {
  it('computes partial for measurement detail with dimensions', () => {
    const fixture = [
      '~V|O|FIEBDC-3/2020|Presto|||1|||',
      '~C|01||Surface|||0|',
      // length=10, latitude=5, height=2, units=3 => partial = 10*5*2*3 = 300
      '~M|01|1\\|1000|S\\Comment\\3\\10\\5\\2|',
    ].join('\r\n');

    const result = BC3.parse(fixture);
    assert.equal(result.diagnostics.length, 0);
    const node = result.document!.getConcept('01');
    assert.ok(node);
    assert.equal(node.measurements.length, 1);

    const details = node.measurements[0]!.details;
    assert.equal(details.length, 1);

    const detail = details[0]!;
    assert.equal(detail.length, 10);
    assert.equal(detail.latitude, 5);
    assert.equal(detail.height, 2);
    assert.equal(detail.units, 3);
    assert.equal(detail.partial, 300);
  });

  it('partial defaults missing dimensions to 1', () => {
    const fixture = [
      '~V|O|FIEBDC-3/2020|Presto|||1|||',
      '~C|01||Length only|||0|',
      // length=1263.233, others blank => partial = 1263.233 * 1 * 1 * 1 = 1263.233
      '~M|01|1\\|1263.233|T\\Demolicion\\\\1263.233||||',
    ].join('\r\n');

    const result = BC3.parse(fixture);
    assert.equal(result.diagnostics.length, 0);
    const node = result.document!.getConcept('01');
    assert.ok(node);
    const detail = node.measurements[0]!.details[0]!;
    assert.equal(detail.length, 1263.233);
    assert.equal(detail.partial, 1263.233);
  });

  it('partial is 1 when no dimensions are present', () => {
    const fixture = [
      '~V|O|FIEBDC-3/2020|Presto|||1|||',
      '~C|01||No dims|||0|',
      '~M|01|1\\|10|T\\Comment|||||',
    ].join('\r\n');

    const result = BC3.parse(fixture);
    const node = result.document!.getConcept('01');
    assert.ok(node);
    const detail = node.measurements[0]!.details[0]!;
    assert.equal(detail.partial, 1);
  });

  it('multiple details each get their own partial', () => {
    const fixture = [
      '~V|O|FIEBDC-3/2020|Presto|||1|||',
      '~C|01||Multi detail|||0|',
      '~M|01|1\\2\\|50|T\\C1\\1\\10\\5\\2\\T\\C2\\2\\3\\4\\5|',
    ].join('\r\n');

    const result = BC3.parse(fixture);
    const node = result.document!.getConcept('01');
    const details = node!.measurements[0]!.details;
    assert.equal(details.length, 2);
    // Detail 1: 10*5*2*1 = 100
    assert.equal(details[0]!.partial, 100);
    // Detail 2: 3*4*5*2 = 120
    assert.equal(details[1]!.partial, 120);
  });
});
