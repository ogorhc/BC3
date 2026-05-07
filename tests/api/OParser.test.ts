import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BC3 } from '../../src/api/BC3.js';

const WITH_O_BC3 = [
  '~V|OBRA|FIEBDC-3/2020|Test|||1|||',
  '~C|01||Concept|||0|',
  '~O|01|Alicante\\288293.19\\Andalucia\\286082.96\\Aragon\\290709.78\\|',
].join('\r\n');

const WITHOUT_O_BC3 = [
  '~V|OBRA|FIEBDC-3/2020|Test|||1|||',
  '~C|01||Concept|||0|',
].join('\r\n');

describe('~O records (cost overrides)', () => {
  it('parses ~O record into cost overrides', () => {
    const result = BC3.parse(WITH_O_BC3, { mode: 'lenient' });
    assert.ok(result.document);
    assert.equal(result.diagnostics.length, 0);

    const override = result.document.costOverrides.get('01');
    assert.ok(override);
    assert.equal(override.conceptCode, '01');
    assert.equal(override.locations.length, 3);

    assert.deepEqual(override.locations[0], {
      location: 'Alicante',
      price: 288293.19,
    });
    assert.deepEqual(override.locations[1], {
      location: 'Andalucia',
      price: 286082.96,
    });
    assert.deepEqual(override.locations[2], {
      location: 'Aragon',
      price: 290709.78,
    });
  });

  it('costOverrides is empty when no ~O records present', () => {
    const result = BC3.parse(WITHOUT_O_BC3, { mode: 'lenient' });
    assert.ok(result.document);
    assert.equal(result.document.costOverrides.size, 0);
  });

  it('works in strict mode', () => {
    const result = BC3.parse(WITH_O_BC3, { mode: 'strict' });
    assert.ok(result.document);
    assert.ok(result.document.costOverrides.get('01'));
  });

  it('emits warning when concept code is missing', () => {
    const fixture = ['~V|T|FIEBDC-3/2020||||||', '~O||Alicante\\100\\|'].join(
      '\r\n',
    );

    const result = BC3.parse(fixture, { mode: 'lenient' });
    const warnings = result.diagnostics.filter(
      (d) => d.code === 'BC3_O_MISSING_CODE',
    );
    assert.equal(warnings.length, 1);
  });
});
