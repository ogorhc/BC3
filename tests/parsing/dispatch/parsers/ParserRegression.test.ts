import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BC3 } from '../../../../src/api/BC3.js';

const BASE_FIXTURE = ['~V|T|FIEBDC-3/2020|||', '~C|01||Concept|||0|'];

describe('TParser (~T records)', () => {
  it('stores text on concept', () => {
    const fixture = [...BASE_FIXTURE, '~T|01|Description of concept 01|'].join(
      '\r\n',
    );

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);
    assert.equal(result.diagnostics.length, 0);

    const node = result.document.getConcept('01');
    assert.ok(node);
    assert.equal(node.concept.text, 'Description of concept 01');
  });

  it('silently skips when code is empty', () => {
    const fixture = [...BASE_FIXTURE, '~T||Some text without code|'].join(
      '\r\n',
    );

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);
    assert.equal(result.diagnostics.length, 0);
  });
});

describe('MParser (~M records)', () => {
  it('stores measurement on concept', () => {
    const fixture = [...BASE_FIXTURE, '~M|01||100|||'].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);
    assert.equal(result.diagnostics.length, 0);

    const node = result.document.getConcept('01');
    assert.ok(node);
    assert.equal(node.measurements.length, 1);
    assert.equal(node.measurements[0]!.conceptCode, '01');
    assert.equal(node.measurements[0]!.total, 100);
  });

  it('emits warning when code is missing', () => {
    const fixture = [...BASE_FIXTURE, '~M|||100|||'].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    const warnings = result.diagnostics.filter(
      (d) => d.code === 'BC3_M_MISSING_CODE',
    );
    assert.equal(warnings.length, 1);
  });
});

describe('EParser (~E records)', () => {
  it('stores entity in document', () => {
    const fixture = [
      ...BASE_FIXTURE,
      '~E|ENT01|Supplier|Acme Corp||ENT123\\|',
    ].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);
    assert.equal(result.diagnostics.length, 0);

    const entity = result.document.entities.get('ENT01');
    assert.ok(entity);
    assert.equal(entity.name, 'Acme Corp');
    assert.equal(entity.summary, 'Supplier');
    assert.equal(entity.cif, 'ENT123');
  });
});

describe('AParser (~A records)', () => {
  it('stores thesaurus on concept', () => {
    const fixture = [...BASE_FIXTURE, '~A|01|KEY_A\\KEY_B\\|'].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);

    const node = result.document.getConcept('01');
    assert.ok(node);
    assert.ok(node.thesaurus);
    assert.deepEqual(node.thesaurus.keys, ['KEY_A', 'KEY_B']);
  });

  it('emits warning when code is missing', () => {
    const fixture = [...BASE_FIXTURE, '~A||KEY_A\\|'].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    const warnings = result.diagnostics.filter(
      (d) => d.code === 'BC3_A_MISSING_CODE',
    );
    assert.equal(warnings.length, 1);
  });
});

describe('XParser (~X records)', () => {
  it('stores IT codes dictionary on document', () => {
    const fixture = [
      ...BASE_FIXTURE,
      '~X||IT01\\Description 1\\unit1\\IT02\\Description 2\\unit2\\|',
    ].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);
    assert.ok(result.document.itCodesDictionary);
    assert.equal(result.document.itCodesDictionary.items.length, 2);
    assert.equal(result.document.itCodesDictionary.items[0]!.itCode, 'IT01');
  });

  it('stores per-concept IT codes', () => {
    const fixture = [...BASE_FIXTURE, '~X|01|BIM_SIZE\\12\\|'].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);

    const node = result.document.getConcept('01');
    assert.ok(node);
    assert.ok(node.itCodes);
    assert.equal(node.itCodes.items.length, 1);
    assert.equal(node.itCodes.items[0]!.itCode, 'BIM_SIZE');
    assert.equal(node.itCodes.items[0]!.value, '12');
  });
});

describe('LParser (~L records)', () => {
  it('stores specification dictionary on document', () => {
    const fixture = [...BASE_FIXTURE, '~L||SEC01\\Section Label\\|'].join(
      '\r\n',
    );

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);
    assert.ok(result.document.specificationsDictionary);
    assert.equal(result.document.specificationsDictionary.sections.length, 1);
    assert.equal(
      result.document.specificationsDictionary.sections[0]!.sectionCode,
      'SEC01',
    );
  });

  it('stores per-concept specification', () => {
    const fixture = [
      ...BASE_FIXTURE,
      '~L|01|SEC01\\Section Text\\Section RTF\\Section HTM\\|',
    ].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);

    const node = result.document.getConcept('01');
    assert.ok(node);
    assert.ok(node.specification);
    assert.equal(node.specification.sections.length, 1);
  });
});

describe('NParser (~N records)', () => {
  it('stores measurement like ~M', () => {
    const fixture = [...BASE_FIXTURE, '~N|01||200|||'].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);

    const node = result.document.getConcept('01');
    assert.ok(node);
    assert.equal(node.measurements.length, 1);
    assert.equal(node.measurements[0]!.total, 200);
  });
});

describe('BParser (~B records)', () => {
  it('applies code rename', () => {
    const fixture = [
      ...BASE_FIXTURE,
      '~B|01|NEW01|||',
      '~C|NEW01||Renamed|||0|',
    ].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);

    const node = result.document.getConcept('NEW01');
    assert.ok(node);
    assert.equal(node.concept.code, 'NEW01');
  });
});

describe('YParser (~Y records)', () => {
  it('stores decomposition like ~D', () => {
    const fixture = [
      ...BASE_FIXTURE,
      '~C|02||Child|||1|',
      '~Y|01|02\\2\\1\\|',
    ].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    assert.ok(result.document);

    const node = result.document.getConcept('01');
    assert.ok(node);
    assert.equal(node.decompositions.length, 1);
    assert.equal(node.decompositions[0]!.childCode, '02');
  });
});

describe('UnknownRecordParser', () => {
  it('emits warning in lenient mode', () => {
    const fixture = [...BASE_FIXTURE, '~Z|some|unknown|record|'].join('\r\n');

    const result = BC3.parse(fixture, { mode: 'lenient' });
    const warnings = result.diagnostics.filter(
      (d) => d.code === 'BC3_UNKNOWN_RECORD',
    );
    assert.equal(warnings.length, 1);
  });

  it('throws in strict mode', () => {
    const fixture = [...BASE_FIXTURE, '~Z|some|unknown|record|'].join('\r\n');

    assert.throws(() => BC3.parse(fixture, { mode: 'strict' }));
  });
});
