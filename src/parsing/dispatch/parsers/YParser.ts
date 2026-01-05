import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { DecompositionInput, DecompositionLineInput } from './types/Parsers';
import { RecordParser } from './types/RecordParser';

function isNonEmpty(s: string | undefined): s is string {
  return typeof s === 'string' && s.trim().length > 0;
}

export class YParser implements RecordParser {
  readonly type = 'Y';

  parse(record: RawRecord, ctx: ParseContext): void {
    const f = record.fields;

    const parent = f[0]?.[0]?.trim() ?? '';
    if (!parent) return;

    const lineFields = f.slice(1).filter((sub) => isNonEmpty(sub?.[0]));
    const lines: DecompositionLineInput[] = lineFields.map((sub) => ({
      code: sub[0]?.trim() ?? '',
      factor: isNonEmpty(sub[1]) ? sub[1].trim() : undefined,
      performance: isNonEmpty(sub[2]) ? sub[2].trim() : undefined,
      // porcentajes: lo parseas igual que en DParser si quieres
      raw: sub,
    }));

    const payload: DecompositionInput = { parent, lines };
    ctx.builder.onY(payload);
  }
}
