import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { RecordParser } from './types/RecordParser';

export class TParser implements RecordParser {
  readonly type = 'T';

  parse(record: RawRecord, ctx: ParseContext): void {
    // ~T | CODIGO | TEXTO |
    const code = record.fields[0]?.[0] ?? '';
    const text = record.fields[1]?.[0] ?? '';

    if (!code) return;
    ctx.builder.onT({ code, text });
  }
}
