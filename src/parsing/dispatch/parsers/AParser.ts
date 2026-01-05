import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { RecordParser } from './types/RecordParser';

/**
 * Parser for ~A records (Thesaurus).
 *
 * Format:
 * ~A | CODIGO_CONCEPTO | < CLAVE_TESAURO \ > |
 */
export class AParser implements RecordParser {
  readonly type = 'A';

  parse(record: RawRecord, ctx: ParseContext): void {
    const f = record.fields;

    const conceptCode = f[0]?.[0] ?? '';
    const thesaurusKeys = (f[1] ?? []).filter(Boolean);

    if (!conceptCode) {
      ctx.diagnostics.push({
        level: 'warn',
        code: 'BC3_A_MISSING_CODE',
        message: 'Record ~A without CODIGO_CONCEPTO.',
        recordIndex: record.index,
        recordType: record.type,
      });
      return;
    }

    ctx.builder.onA({
      conceptCode,
      thesaurusKeys,
    });
  }
}
