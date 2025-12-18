import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { RecordParser } from './types/RecordParser';

export class UnknownRecordParser implements RecordParser {
  readonly type = '*';

  parse(record: RawRecord, ctx: ParseContext): void {
    if (ctx.options.mode === 'strict') {
      ctx.diagnostics.push({
        level: 'error',
        code: 'BC3_UNKNOWN_RECORD',
        message: `Unknown record type "~${record.type}".`,
        recordIndex: record.index,
        recordType: record.type,
      });
    }
  }
}
