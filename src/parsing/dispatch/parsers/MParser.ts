import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { MeasurementDetailInput } from './types/Parsers';
import { RecordParser } from './types/RecordParser';

function extractBimIdsFromComment(comment?: string): string[] | undefined {
  if (!comment) return undefined;

  const matches = comment.match(/#[^\s#|\\]+/g);
  if (!matches) return undefined;

  const ids = matches.map((m) => m.slice(1)).filter(Boolean);
  return ids.length ? ids : undefined;
}

/**
 * ~M | [PADRE\]HIJO | { POSICION\ } | MEDICION_TOTAL | { TIPO \ COMENTARIO {#ID_BIM}\ U \ L \ La \ A \ } | [ETIQUETA] |
 */
function parseDetails(detailField: string[]): MeasurementDetailInput[] {
  const out: MeasurementDetailInput[] = [];
  const CHUNK = 6;

  if (detailField.length === 0) return out;

  // Si no llega múltiplo de 6, igual lo guardamos: se agrupa en el último chunk
  for (let i = 0; i < detailField.length; i += CHUNK) {
    const raw = detailField.slice(i, i + CHUNK);

    const comment = raw[1];
    const bimIds = extractBimIdsFromComment(comment);

    out.push({
      type: raw[0] || undefined,
      comment: comment || undefined,
      bimIds,
      units: raw[2] || undefined,
      length: raw[3] || undefined,
      latitude: raw[4] || undefined,
      height: raw[5] || undefined,
      raw,
    });
  }

  return out;
}

export class MParser implements RecordParser {
  readonly type = 'M';

  parse(record: RawRecord, ctx: ParseContext): void {
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
