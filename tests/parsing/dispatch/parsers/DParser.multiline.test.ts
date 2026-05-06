import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BC3 } from '../../../../src/api/BC3.js';

const MULTILINE_D_BC3 = [
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

describe('Multiline ~D from ARQUIMEDES generator', () => {
  it('parses all children from multiline ~D records', () => {
    const result = BC3.parse(MULTILINE_D_BC3, { mode: 'lenient' });
    assert.ok(result.document);
    assert.equal(result.diagnostics.length, 0);

    const root = result.document.getConcept('QUISI_V02#');
    assert.ok(root, 'root concept not found');
    assert.equal(root.decompositions.length, 3);

    const childCodes = root.decompositions.map((d) => d.childCode);
    assert.deepEqual(childCodes, ['CAP.01', 'CAP.02', 'CAP.03']);
  });

  it('parses children with correct factor values', () => {
    const result = BC3.parse(MULTILINE_D_BC3, { mode: 'lenient' });
    assert.ok(result.document);

    const root = result.document.getConcept('QUISI_V02#');
    assert.ok(root);

    for (const d of root.decompositions) {
      assert.equal(d.factor, 1);
      assert.equal(d.performance, undefined);
    }
  });

  it('works in strict mode', () => {
    const result = BC3.parse(MULTILINE_D_BC3, { mode: 'strict' });
    assert.ok(result.document);

    const root = result.document.getConcept('QUISI_V02#');
    assert.ok(root);
    assert.equal(root.decompositions.length, 3);
  });

  it('does not break single-line ~D (non-regression)', () => {
    const fixture = [
      '~V|T|FIEBDC-3/2020|||',
      '~C|PARENT||Parent|||0|',
      '~C|1001||Child|||1|',
      '~D|PARENT|1001\\2\\1\\|',
    ].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);

    const a = result.document.getConcept('PARENT');
    assert.ok(a);
    assert.equal(a.decompositions.length, 1);

    const d = a.decompositions[0]!;
    assert.equal(d.childCode, '1001');
    assert.equal(d.factor, 2);
    assert.equal(d.performance, 1);
  });
});
