import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BC3 } from '../../src/api/BC3.js';

const UNMATCHED_PARENT_BC3 = [
  '~V|T|FIEBDC-3/2020|||',
  '~C|CHILD01||Child|||1|',
  '~D|MISSING_PARENT|CHILD01\\1\\1\\|',
].join('\r\n');

const UNMATCHED_CHILD_BC3 = [
  '~V|T|FIEBDC-3/2020|||',
  '~C|PARENT||Parent|||0|',
  '~D|PARENT|MISSING_CHILD\\1\\1\\|',
].join('\r\n');

describe('~D silent diagnostics', () => {
  it('emits warning when ~D parent code unmatched', () => {
    const result = BC3.parse(UNMATCHED_PARENT_BC3, { mode: 'lenient' });
    assert.ok(result.document);

    const warnings = result.diagnostics.filter(
      (d) => d.code === 'BC3_D_MISSING_PARENT_CODE',
    );
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0]!.level, 'warn');
    assert.match(warnings[0]!.message, /MISSING_PARENT/);
  });

  it('emits warning when ~D child code unmatched', () => {
    const result = BC3.parse(UNMATCHED_CHILD_BC3, { mode: 'lenient' });
    assert.ok(result.document);

    const warnings = result.diagnostics.filter(
      (d) => d.code === 'BC3_D_MISSING_CHILD_CODE',
    );
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0]!.level, 'warn');
    assert.match(warnings[0]!.message, /MISSING_CHILD/);
  });

  it('does not emit warnings when all codes match', () => {
    const fixture = [
      '~V|T|FIEBDC-3/2020|||',
      '~C|PARENT||Parent|||0|',
      '~C|1001||Child|||1|',
      '~D|PARENT|1001\\1\\1\\|',
    ].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);
    assert.equal(result.diagnostics.length, 0);
  });
});
