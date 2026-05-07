import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BC3 } from '../../../../src/api/BC3.js';

describe('GParser (~G records)', () => {
  it('stores attachment from ~G record', () => {
    const result = BC3.parse(
      '~G|01|image.png\\|\r\n~C|01||Graphic Concept|||0|\r\n',
    );
    assert.equal(result.diagnostics.length, 0);
    assert.ok(result.document);
    assert.equal(result.document.attachments.length, 1);
    const att = result.document.attachments[0]!;
    assert.equal(att.conceptCode, '01');
    assert.equal(att.type, 'graphic');
    assert.equal(att.url, 'image.png');
  });

  it('emits warning for ~G without concept code', () => {
    const result = BC3.parse('~G||file.png\\|\r\n');
    assert.ok(result.diagnostics.some((d) => d.code === 'BC3_G_MISSING_CODE'));
    assert.equal(result.document!.attachments.length, 0);
  });

  it('emits warning for ~G without filename', () => {
    const result = BC3.parse('~G|01||\r\n');
    assert.ok(
      result.diagnostics.some((d) => d.code === 'BC3_G_MISSING_FILENAME'),
    );
    assert.equal(result.document!.attachments.length, 0);
  });

  it('handles real-world format with trailing \\|', () => {
    const result = BC3.parse(
      '~G|19-026-L3_PC01##|3QE0h_A1j7Qg5Sp4dO8t26Bg.png\\|\r\n' +
        '~C|19-026-L3_PC01##||Concept|||0|\r\n',
    );
    assert.equal(result.diagnostics.length, 0);
    assert.equal(result.document!.attachments.length, 1);
    assert.equal(
      result.document!.attachments[0]!.url,
      '3QE0h_A1j7Qg5Sp4dO8t26Bg.png',
    );
  });
});
