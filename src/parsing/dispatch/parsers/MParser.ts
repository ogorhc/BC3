import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { RecordParser } from './types/RecordParser';
import { parseDetails } from './helpers/parserDetails';

export class MParser implements RecordParser {
  readonly type = 'M';

  parse(record: RawRecord, ctx: ParseContext): void {
    //  ~M | [PADRE\]HIJO | { POSICION\ } | MEDICION_TOTAL | { TIPO \ COMENTARIO {#ID_BIM}\ U \ L \ La \ A \ } | [ETIQUETA] |
    const f = record.fields;

    const rel = f[0] ?? [];
    const rawCode = rel[0] ?? '';

    if (!rawCode) {
      ctx.diagnostics.push({
        level: 'warn',
        code: 'BC3_M_MISSING_CODE',
        message: 'Record ~M without code in first field.',
        recordIndex: record.index,
        recordType: record.type,
      });
      return;
    }

    const positions = (f[1] ?? []).filter(Boolean);
    const total = f[2]?.[0] || undefined;

    const detailRaw = f[3] ?? [];
    const details = parseDetails(detailRaw);

    const label = f[4]?.[0] || undefined;

    ctx.builder.onM({
      rawCode,
      positions,
      total,
      details,
      label,
      rawFields: f,
    });
  }
}
