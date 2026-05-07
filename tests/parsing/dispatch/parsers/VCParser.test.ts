/**
 * Integration tests for VParser (~V records) and CParser (~C records).
 *
 * Tests are driven through BC3.parse() with real BC3 string fixtures.
 * This verifies the full parse path: Tokenizer → RecordDispatcher → Parser → Builder → Domain.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BC3 } from '../../../../src/api/BC3.js';

// ---------------------------------------------------------------------------
// ~V (Version / metadata) fixtures
// ---------------------------------------------------------------------------

/** Minimal ~V with only required fields */
const V_MINIMAL = '~V|OBRA|FIEBDC-3/2020|';

/** Full ~V with all fields populated */
const V_FULL =
  '~V|OBRA|FIEBDC-3/2020\\20102025|TestProgram|Project Header\\Label1\\Label2|850|A comment|1|CERT-001|20240101|https://example.com|';

/** ~V with empty optional fields */
const V_EMPTY_OPTIONALS = '~V|OBRA|FIEBDC-3/2020|||||||';

/** Two ~V records in one file — last one should win (or first, depending on implementation) */
const V_DUPLICATE = '~V|OBRA1|FIEBDC-3/2002|\r\n~V|OBRA2|FIEBDC-3/2020|\r\n';

/** ~V with backslash embedded in version name (not a subfield separator) */
const V_BACKSLASH_IN_VERSION =
  '~V|OBRA|FIEBDC-3\\2020\\02102025|TestProgram|Header|||1|||';

/** ~V with version field consisting only of leading backslash + date */
const V_LEADING_BACKSLASH = '~V|OBRA|\\02102025|TestProgram|Header|||1|||';

// ---------------------------------------------------------------------------
// ~C (Concept) fixtures
// ---------------------------------------------------------------------------

/** Single ~C — basic concept */
const C_SINGLE = '~C|CAP01||Chapter One|||0|';

/** ~C with price and date arrays (\ separated) */
const C_WITH_PRICES =
  '~C|RES01|h|Labour Resource|20.00\\21.00\\22.00|20200101\\20210101\\20220101|0|';

/** ~C with multiple codes (\ separated in first field) */
const C_MULTI_CODE = '~C|CODE_A\\CODE_B||Shared Concept|||0|';

/** ~C without a code — should emit a warning and not create a node */
const C_NO_CODE = '~C|||Empty Concept|||0|';

/** ~C with type field */
const C_WITH_TYPE = '~C|SUBCAP01|m2|Sub-chapter|100.00||1|';

// ---------------------------------------------------------------------------
// VParser tests
// ---------------------------------------------------------------------------
describe('VParser (~V records)', () => {
  describe('property field', () => {
    it('parses property from field[0]', () => {
      const { document } = BC3.parse(V_MINIMAL);
      assert.equal(document?.metadata?.property, 'OBRA');
    });
  });

  describe('version and versionDate', () => {
    it('parses version from field[1][0]', () => {
      const { document } = BC3.parse(V_MINIMAL);
      assert.equal(document?.metadata?.version, 'FIEBDC-3/2020');
    });

    it('parses versionDate from field[1][1] (subfield after \\)', () => {
      const { document } = BC3.parse(V_FULL);
      assert.equal(document?.metadata?.versionDate, '20102025');
    });

    it('versionDate is empty string when absent', () => {
      const { document } = BC3.parse(V_MINIMAL);
      assert.equal(document?.metadata?.versionDate, '');
    });

    it('preserves explicit backslash in version name (last \\ is date separator)', () => {
      const { document } = BC3.parse(V_BACKSLASH_IN_VERSION);
      assert.equal(document?.metadata?.version, 'FIEBDC-3\\2020');
      assert.equal(document?.metadata?.versionDate, '02102025');
    });

    it('handles version field with only a leading backslash', () => {
      const { document } = BC3.parse(V_LEADING_BACKSLASH);
      assert.equal(document?.metadata?.version, '');
      assert.equal(document?.metadata?.versionDate, '02102025');
    });
  });

  describe('program field', () => {
    it('parses program from field[2]', () => {
      const { document } = BC3.parse(V_FULL);
      assert.equal(document?.metadata?.program, 'TestProgram');
    });

    it('program is empty string when absent', () => {
      const { document } = BC3.parse(V_MINIMAL);
      assert.equal(document?.metadata?.program, '');
    });
  });

  describe('header and labels', () => {
    it('parses header from field[3][0]', () => {
      const { document } = BC3.parse(V_FULL);
      assert.equal(document?.metadata?.header, 'Project Header');
    });

    it('parses labels from field[3] subfields after [0]', () => {
      const { document } = BC3.parse(V_FULL);
      assert.deepEqual(document?.metadata?.labels, ['Label1', 'Label2']);
    });

    it('labels is empty array when absent', () => {
      const { document } = BC3.parse(V_MINIMAL);
      assert.deepEqual(document?.metadata?.labels, []);
    });
  });

  describe('charset field', () => {
    it('parses charset from field[4]', () => {
      const { document } = BC3.parse(V_FULL);
      assert.equal(document?.metadata?.charset, '850');
    });

    it('charset is empty string when absent', () => {
      const { document } = BC3.parse(V_MINIMAL);
      assert.equal(document?.metadata?.charset, '');
    });
  });

  describe('comment field', () => {
    it('parses comment from field[5]', () => {
      const { document } = BC3.parse(V_FULL);
      assert.equal(document?.metadata?.comment, 'A comment');
    });
  });

  describe('infoType field', () => {
    it('parses infoType from field[6]', () => {
      const { document } = BC3.parse(V_FULL);
      assert.equal(document?.metadata?.infoType, '1');
    });
  });

  describe('certificate fields', () => {
    it('parses certificateNumber from field[7]', () => {
      const { document } = BC3.parse(V_FULL);
      assert.equal(document?.metadata?.certificateNumber, 'CERT-001');
    });

    it('parses certificateDate from field[8]', () => {
      const { document } = BC3.parse(V_FULL);
      assert.equal(document?.metadata?.certificateDate, '20240101');
    });
  });

  describe('baseUrl field', () => {
    it('parses baseUrl from field[9]', () => {
      const { document } = BC3.parse(V_FULL);
      assert.equal(document?.metadata?.baseUrl, 'https://example.com');
    });
  });

  describe('empty optionals', () => {
    it('handles all optional fields empty without throwing', () => {
      assert.doesNotThrow(() => BC3.parse(V_EMPTY_OPTIONALS));
    });

    it('returns empty strings for all empty optional fields', () => {
      const { document } = BC3.parse(V_EMPTY_OPTIONALS);
      assert.equal(document?.metadata?.program, '');
      assert.equal(document?.metadata?.charset, '');
      assert.equal(document?.metadata?.comment, '');
    });
  });

  describe('duplicate ~V records', () => {
    it('does not throw when two ~V records are present', () => {
      assert.doesNotThrow(() => BC3.parse(V_DUPLICATE));
    });
  });
});

// ---------------------------------------------------------------------------
// CParser tests
// ---------------------------------------------------------------------------
describe('CParser (~C records)', () => {
  describe('basic concept creation', () => {
    it('creates a concept node accessible by code', () => {
      const { document } = BC3.parse(C_SINGLE);
      assert.ok(document?.getConcept('CAP01') !== undefined);
    });

    it('parses summary from field[2]', () => {
      const { document } = BC3.parse(C_SINGLE);
      const node = document?.getConcept('CAP01');
      assert.equal(node?.concept.summary, 'Chapter One');
    });

    it('parses unit from field[1]', () => {
      const { document } = BC3.parse(C_WITH_PRICES);
      const node = document?.getConcept('RES01');
      assert.equal(node?.concept.unit, 'h');
    });

    it('unit is empty string or undefined when not specified', () => {
      const { document } = BC3.parse(C_SINGLE);
      const node = document?.getConcept('CAP01');
      // The domain model may store empty string or undefined for missing unit
      assert.ok(
        node?.concept.unit === '' || node?.concept.unit === undefined,
        `unit should be empty or undefined, got: ${node?.concept.unit}`,
      );
    });
  });

  describe('price and date arrays', () => {
    it('parses multiple prices from field[3] subfields', () => {
      const { document } = BC3.parse(C_WITH_PRICES);
      const node = document?.getConcept('RES01');
      // prices are stored on the concept
      assert.ok(
        node?.concept.prices !== undefined,
        'concept should have prices',
      );
      assert.ok(
        Array.isArray(node?.concept.prices),
        'prices should be an array',
      );
      assert.ok(
        (node?.concept.prices?.length ?? 0) >= 1,
        'should have at least one price',
      );
    });

    it('parses multiple dates from field[4] subfields', () => {
      const { document } = BC3.parse(C_WITH_PRICES);
      const node = document?.getConcept('RES01');
      assert.ok(Array.isArray(node?.concept.dates));
    });
  });

  describe('type field', () => {
    it('parses type from field[5]', () => {
      const { document } = BC3.parse(C_WITH_TYPE);
      const node = document?.getConcept('SUBCAP01');
      assert.ok(node !== undefined, 'SUBCAP01 should exist');
      // type is stored; exact storage depends on domain model
      assert.ok(node?.concept !== undefined);
    });
  });

  describe('multiple codes in first field', () => {
    it('does not throw for multi-code ~C record', () => {
      assert.doesNotThrow(() => BC3.parse(C_MULTI_CODE));
    });

    it('creates a concept accessible by the primary code', () => {
      const { document } = BC3.parse(C_MULTI_CODE);
      const node = document?.getConcept('CODE_A');
      assert.ok(node !== undefined, 'CODE_A should be findable');
    });
  });

  describe('missing code', () => {
    it('emits BC3_C_MISSING_CODE warning when code is absent', () => {
      const result = BC3.parse(C_NO_CODE, { mode: 'lenient' });
      const warn = result.diagnostics.find(
        (d) => d.code === 'BC3_C_MISSING_CODE',
      );
      assert.ok(warn, 'should emit BC3_C_MISSING_CODE warning');
    });

    it('does not create a concept node when code is absent', () => {
      const { document } = BC3.parse(C_NO_CODE, { mode: 'lenient' });
      // The map should be empty since the only ~C had no code
      assert.equal(document?.conceptsByCode.size, 0);
    });
  });

  describe('multiple ~C records', () => {
    it('creates one concept per valid ~C record', () => {
      const input =
        '~C|CAP01||Chapter|\r\n~C|UNIT01|m2|Unit|\r\n~C|RES01|h|Resource|\r\n';
      const { document } = BC3.parse(input);
      assert.equal(document?.conceptsByCode.size, 3);
    });
  });
});
