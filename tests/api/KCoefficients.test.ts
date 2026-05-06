import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BC3 } from '../../src/api/BC3.js';

const WITH_K_BC3 = [
  '~V|OBRA|FIEBDC-3/2020|TestProg|Header||ANSI||1|||',
  '~K|4\\2\\3\\6\\1\\6\\10\\EUR||6\\3\\4\\6\\6\\1\\10\\EUR\\1\\4\\2\\2\\10\\|',
  '~C|01||Concept|||0|',
].join('\r\n');

const WITHOUT_K_BC3 = [
  '~V|OBRA|FIEBDC-3/2020|TestProg|Header||ANSI||1|||',
  '~C|01||Concept|||0|',
].join('\r\n');

describe('~K coefficient data in BC3Document', () => {
  it('exposes coefficients when ~K record is present', () => {
    const result = BC3.parse(WITH_K_BC3, { mode: 'lenient' });
    assert.ok(result.document);
    assert.ok(result.document.coefficients);

    assert.ok(Array.isArray(result.document.coefficients.legacy));
    assert.ok(result.document.coefficients.legacy.length > 0);
    assert.equal(result.document.coefficients.legacy[0], '4');

    assert.ok(Array.isArray(result.document.coefficients.full));
    assert.ok(result.document.coefficients.full.length > 0);
    assert.equal(result.document.coefficients.full[0], '6');

    assert.equal(typeof result.document.coefficients.raw, 'string');
  });

  it('coefficients is undefined when no ~K record is present', () => {
    const result = BC3.parse(WITHOUT_K_BC3, { mode: 'lenient' });
    assert.ok(result.document);
    assert.equal(result.document.coefficients, undefined);
  });

  it('coefficients in strict mode', () => {
    const result = BC3.parse(WITH_K_BC3, { mode: 'strict' });
    assert.ok(result.document);
    assert.ok(result.document.coefficients);
    assert.ok(result.document.coefficients.legacy.length > 0);
  });
});
