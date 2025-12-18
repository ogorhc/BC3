import type { RawRecord } from '../types/RawRecord';
import { RecordParser } from './parsers/types/RecordParser';
import { ParseContext } from './types/ParseContext';

export class RecordDispatcher {
  private readonly parsers: Map<string, RecordParser>;

  constructor(parsers: RecordParser[]) {
    this.parsers = new Map(parsers.map((p) => [p.type, p]));
  }

  dispatch(records: RawRecord[], ctx: ParseContext) {
    for (const record of records) {
      const parser = this.parsers.get(record.type);
      if (!parser) {
        if (ctx.options.mode === 'strict') {
          throw new Error(`Unknown record type "~${record.type}"`);
        }
        ctx.diagnostics.push({
          level: 'warn',
          code: 'BC3_UNKNOWN_RECORD',
          message: `Unknown record type "~${record.type}"`,
          recordIndex: record.index,
          recordType: record.type,
        });
        continue;
      }

      parser.parse(record, ctx);
    }
  }
}
