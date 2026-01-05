import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { CodeChangeInput } from './types/Parsers';
import { RecordParser } from './types/RecordParser';

function isNonEmpty(s: string | undefined): s is string {
  return typeof s === 'string' && s.trim().length > 0;
}

export class BParser implements RecordParser {
  readonly type = 'B';

  parse(record: RawRecord, ctx: ParseContext): void {
    // ~B | CODIGO_CONCEPTO | CODIGO_NUEVO |
    const f = record.fields;
    const from = f[0]?.[0]?.trim() ?? '';
    if (!isNonEmpty(from)) return;

    const to = f[1]?.[0]?.trim();
    const payload: CodeChangeInput = {
      from,
      to: to ?? '',
      rawFields: f,
    };

    ctx.builder.onB(payload);
  }
}
