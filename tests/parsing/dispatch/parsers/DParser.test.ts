import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BC3 } from '../../../../src/api/BC3.js';

const DOT_CHILD_BC3 = [
  '~V|BugRepro|FIEBDC-3/2020|||',
  '~C|ITEM.A|m2|Item with dot in code|30|250101|0|',
  '~C|WORKER.1a|h|Worker type A|20|250101|1|',
  '~C|WORKER2b|h|Worker type B|15|250101|1|',
  '~C|MAT01|kg|Material one|5|250101|3|',
  '~D|ITEM.A|WORKER.1a\\1\\0.5\\WORKER2b\\1\\0.3\\MAT01\\1\\1.2\\|',
].join('\r\n');

describe('DParser (~D records)', () => {
  it('parses all children when codes contain dots', () => {
    const result = BC3.parse(DOT_CHILD_BC3, { mode: 'lenient' });
    assert.ok(result.document);

    const itemA = result.document.getConcept('ITEM.A');
    assert.ok(itemA);

    assert.equal(itemA.decompositions.length, 3);

    const [d1, d2, d3] = itemA.decompositions;

    assert.equal(d1!.childCode, 'WORKER.1a');
    assert.equal(d1!.factor, 1);
    assert.equal(d1!.performance, 0.5);

    assert.equal(d2!.childCode, 'WORKER2b');
    assert.equal(d2!.factor, 1);
    assert.equal(d2!.performance, 0.3);

    assert.equal(d3!.childCode, 'MAT01');
    assert.equal(d3!.factor, 1);
    assert.equal(d3!.performance, 1.2);
  });

  it('does not misclassify child codes as percentage codes', () => {
    const result = BC3.parse(DOT_CHILD_BC3, { mode: 'lenient' });
    assert.ok(result.document);

    const itemA = result.document.getConcept('ITEM.A');
    assert.ok(itemA);

    for (const d of itemA.decompositions) {
      assert.deepEqual(d.percentageCodes ?? [], []);
    }
  });

  it('preserves dot in child codes', () => {
    const result = BC3.parse(DOT_CHILD_BC3, { mode: 'lenient' });
    assert.ok(result.document);

    const worker = result.document.getConcept('WORKER.1a');
    assert.ok(worker);
    assert.equal(worker.concept.code, 'WORKER.1a');
  });

  it('parses simple ~D with numeric codes correctly (non-regression)', () => {
    const fixture = [
      '~V|T|FIEBDC-3/2020|||',
      '~C|A||Parent|||0|',
      '~C|1001||Child 1|||1|',
      '~C|1002||Child 2|||1|',
      '~D|A|1001\\2\\1\\1002\\3\\1.5\\|',
    ].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
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

  it('parses ~D in strict mode', () => {
    const result = BC3.parse(DOT_CHILD_BC3, { mode: 'strict' });
    assert.ok(result.document);

    const itemA = result.document.getConcept('ITEM.A');
    assert.ok(itemA);
    assert.equal(itemA.decompositions.length, 3);
  });
});
