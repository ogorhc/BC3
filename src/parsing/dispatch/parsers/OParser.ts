import { isNonEmpty } from '../../../utils/strings';
import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { CostLocationInput } from './types/Parsers';
import { RecordParser } from './types/RecordParser';

export class OParser implements RecordParser {
  readonly type = 'O';

  parse(record: RawRecord, ctx: ParseContext): void {
    // ~O | CODIGO_CONCEPTO | < location \ price \ > |
    const f = record.fields;

    const conceptCode = f[0]?.[0] ?? '';
    if (!conceptCode) {
      ctx.diagnostics.push({
        level: 'warn',
        code: 'BC3_O_MISSING_CODE',
        message: 'Record ~O without CODIGO_CONCEPTO.',
        recordIndex: record.index,
        recordType: record.type,
      });
      return;
    }

    const rawLocations = f[1] ?? [];
    const locations: CostLocationInput[] = [];

    for (let i = 0; i < rawLocations.length; i += 2) {
      const location = rawLocations[i]?.trim();
      if (!isNonEmpty(location)) break;

      const price = rawLocations[i + 1]?.trim() ?? '';
      locations.push({ location, price });
    }

    ctx.builder.onO({ conceptCode, locations });
  }
}
