import { isNonEmpty } from '../../../utils/strings';
import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { MeasurementDetailInput, MeasurementInput } from './types/Parsers';
import { RecordParser } from './types/RecordParser';

export class NParser implements RecordParser {
  readonly type = 'N';

  parse(record: RawRecord, ctx: ParseContext): void {
    const f = record.fields;

    const rawCode = f[0]?.[0] ?? '';
    if (!isNonEmpty(rawCode)) return;

    const positions = (f[1] ?? []).map((x) => x.trim()).filter(isNonEmpty);
    const total = f[2]?.[0] ?? undefined;

    const detailRaw = f[3] ?? [];
    const details: MeasurementDetailInput[] = [
      {
        type: detailRaw[0],
        comment: detailRaw[1],
        units: detailRaw[2],
        length: detailRaw[3],
        latitude: detailRaw[4],
        height: detailRaw[5],
        raw: detailRaw,
      },
    ];

    const etiqueta = f[4]?.[0] ?? undefined;

    const payload: MeasurementInput = {
      rawCode,
      positions,
      total: isNonEmpty(total) ? total : undefined,
      details,
      label: isNonEmpty(etiqueta) ? etiqueta : undefined,
      rawFields: f,
    };

    ctx.builder.onN(payload);
  }
}
