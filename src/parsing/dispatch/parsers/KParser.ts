import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { RecordParser } from './types/RecordParser';

export class KParser implements RecordParser {
  readonly type = 'K';

  parse(record: RawRecord, ctx: ParseContext): void {
    // Simplificado MVP: guarda los subcampos del campo 0 y/o campo 2 como "raw"
    // (más adelante lo modelas bien con estructura)
    const f = record.fields;

    const legacy = f[0] ?? []; // { DN \ DD \ ... \ DIVISA }
    const full = f[2] ?? []; // { DRC \ DC \ ... \ DIVISA \ ... }

    ctx.builder.onK({
      legacy,
      full,
      raw: record.raw,
    });
  }
}
