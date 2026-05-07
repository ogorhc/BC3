import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { RecordParser } from './types/RecordParser';

export class VParser implements RecordParser {
  readonly type = 'V';

  parse(record: RawRecord, ctx: ParseContext): void {
    const f = record.fields;

    const property = f[0]?.[0] ?? '';

    const rawVersionField = (f[1] ?? []).join('\\');
    const lastBackslash = rawVersionField.lastIndexOf('\\');
    const version =
      lastBackslash >= 0
        ? rawVersionField.slice(0, lastBackslash)
        : rawVersionField;
    const versionDate =
      lastBackslash >= 0 ? rawVersionField.slice(lastBackslash + 1) : '';

    const program = f[2]?.[0] ?? '';

    const header = f[3]?.[0] ?? '';
    const labels = (f[3] ?? []).slice(1).filter(Boolean);

    const charset = f[4]?.[0] ?? '';
    const comment = f[5]?.[0] ?? '';

    const infoType = f[6]?.[0] ?? '';
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
