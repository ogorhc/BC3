import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { RecordParser } from './types/RecordParser';

export class CParser implements RecordParser {
  readonly type = 'C';

  parse(record: RawRecord, ctx: ParseContext): void {
    // ~C | CODIGO { \ CODIGO } | UNIDAD | RESUMEN | { PRECIO \ } | { FECHA \ } | TIPO |
    const f = record.fields;

    const codes = (f[0] ?? []).filter(Boolean);
    const code = codes[0] ?? '';

    const unit = f[1]?.[0] ?? '';
    const summary = f[2]?.[0] ?? '';

    const prices = (f[3] ?? []).filter(Boolean);
    const dates = (f[4] ?? []).filter(Boolean);

    const type = f[5]?.[0] ?? '';

    if (!code) {
      ctx.diagnostics.push({
        level: 'warn',
        code: 'BC3_C_MISSING_CODE',
        message: 'Record ~C without CODIGO.',
        recordIndex: record.index,
        recordType: record.type,
      });
      return;
    }

    ctx.builder.onC({
      code,
      codes,
      unit,
      summary,
      prices,
      dates,
      type,
    });
  }
}
