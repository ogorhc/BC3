import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { RecordParser } from './types/RecordParser';

export class VParser implements RecordParser {
  readonly type = 'V';

  parse(record: RawRecord, ctx: ParseContext): void {
    // ~V | PROPIEDAD | VERSION \ FECHA | PROGRAMA | CABECERA \ ROTULOS... | JUEGO | COMENTARIO | TIPO | NUMCERT | FECHACERT | URL_BASE |
    const f = record.fields;

    const property = f[0]?.[0] ?? '';
    const version = f[1]?.[0] ?? '';
    const versionDate = f[1]?.[1] ?? '';

    const program = f[2]?.[0] ?? '';

    const header = f[3]?.[0] ?? '';
    const labels = (f[3] ?? []).slice(1).filter(Boolean);

    const charset = f[4]?.[0] ?? ''; // 850/437/ANSI
    const comment = f[5]?.[0] ?? '';

    const infoType = f[6]?.[0] ?? ''; // 1..4
    const certificateNumber = f[7]?.[0] ?? '';
    const certificateDate = f[8]?.[0] ?? '';

    const baseUrl = f[9]?.[0] ?? '';

    ctx.builder.onV({
      property,
      version,
      versionDate,
      program,
      header,
      labels,
      charset,
      comment,
      infoType,
      certificateNumber,
      certificateDate,
      baseUrl,
    });
  }
}
