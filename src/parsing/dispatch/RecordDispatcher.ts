import { RecordCounts } from '../../domain/types/RecordCounts';
import type { RawRecord } from '../types/RawRecord';
import { RecordParser } from './parsers/types/RecordParser';
import { ParseContext } from './types/ParseContext';

function incrementCount(counts: RecordCounts, type: string): void {
  if (type in counts) {
    (counts as Record<string, number>)[type]++;
  } else {
    counts.unknown++;
  }
}

export class RecordDispatcher {
  private readonly parsers: Map<string, RecordParser>;

  constructor(parsers: RecordParser[]) {
    this.parsers = new Map(parsers.map((p) => [p.type, p]));
  }

  dispatch(records: RawRecord[], ctx: ParseContext) {
    for (const record of records) {
      incrementCount(ctx.recordCounts, record.type);

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

      try {
        parser.parse(record, ctx);
      } catch (e) {
        ctx.diagnostics.push({
          level: 'error',
          code: 'BC3_PARSER_ERROR',
          message: e instanceof Error ? e.message : String(e),
          recordIndex: record.index,
          recordType: record.type,
        });
        if (ctx.options.mode === 'strict') throw e;
      }
    }
  }
}
