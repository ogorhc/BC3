import { isNonEmpty } from '../../../utils/strings';
import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { MeasurementDetailInput, MeasurementInput } from './types/Parsers';
import { RecordParser } from './types/RecordParser';
import { parseDetails } from './helpers/parserDetails';

export class NParser implements RecordParser {
  readonly type = 'N';

  parse(record: RawRecord, ctx: ParseContext): void {
    const f = record.fields;

    const rawCode = f[0]?.[0] ?? '';
    if (!isNonEmpty(rawCode)) {
      ctx.diagnostics.push({
        level: 'warn',
        code: 'BC3_N_MISSING_CODE',
        message: 'Record ~N without code in first field.',
        recordIndex: record.index,
        recordType: record.type,
      });
      return;
    }

    const positions = (f[1] ?? []).map((x) => x.trim()).filter(isNonEmpty);

    const totalRaw = f[2]?.[0];
    const total = isNonEmpty(totalRaw) ? totalRaw : undefined;

    const detailRaw = f[3] ?? [];
    const details = parseDetails(detailRaw);

    const labelRaw = f[4]?.[0];
    const label = isNonEmpty(labelRaw) ? labelRaw : undefined;

    const payload: MeasurementInput = {
      rawCode,
      positions,
      total,
      details,
      label,
      rawFields: f,
    };

    ctx.builder.onN(payload);
  }
}
