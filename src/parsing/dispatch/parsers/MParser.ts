import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { MeasurementDetailInput } from './types/Parsers';
import { RecordParser } from './types/RecordParser';

export class MParser implements RecordParser {
  readonly type = 'M';

  parse(record: RawRecord, ctx: ParseContext): void {
    // MVP: capturar lo mínimo sin evaluar expresiones aún.
    // ~M | [PADRE\]HIJO | { POSICION\ } | MEDICION_TOTAL | { TIPO \ COMENTARIO {#ID_BIM}\ U \ L \ La \ A \ } | [ETIQUETA] |

    const f = record.fields;

    const rel = f[0] ?? [];
    const rawCode = rel[0] ?? '';
    const pos = (f[1] ?? []).filter(Boolean);
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
    const label = f[4]?.[0] ?? undefined;

    ctx.builder.onM({
      rawCode,
      positions: pos,
      total,
      details: details,
      label,
      rawFields: f,
    });
  }
}
