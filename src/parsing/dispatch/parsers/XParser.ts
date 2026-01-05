import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { ITCodeInput } from './types/Parsers';
import { RecordParser } from './types/RecordParser';

/**
 * Parser for ~X records (Items/IT codes).
 *
 * Format:
 * ~X | | < CODIGO_IT \ DESCRIPCION_IT \ UM \ > |
 * ~X | CODIGO_CONCEPTO | < CODIGO_IT \ VALOR_IT \ > |
 */
export class XParser implements RecordParser {
  readonly type = 'X';

  parse(record: RawRecord, ctx: ParseContext): void {
    const f = record.fields;

    // Field 0: empty (dictionary) or CODIGO_CONCEPTO
    const conceptCode = f[0]?.[0] ?? '';

    // Field 1: IT codes dictionary or IT values for concept
    const itemsRaw = f[1] ?? [];
    const items: ITCodeInput[] = [];

    if (conceptCode) {
      // Concept mode: CODIGO_IT \ VALOR_IT
      for (let i = 0; i < itemsRaw.length; i += 2) {
        const itCode = itemsRaw[i];
        if (!itCode) continue;

        items.push({
          itCode,
          value: itemsRaw[i + 1],
        });
      }
    } else {
      // Dictionary mode: CODIGO_IT \ DESCRIPCION_IT \ UM
      for (let i = 0; i < itemsRaw.length; i += 3) {
        const itCode = itemsRaw[i];
        if (!itCode) continue;

        items.push({
          itCode,
          description: itemsRaw[i + 1],
          unit: itemsRaw[i + 2],
        });
      }
    }

    ctx.builder.onX({
      conceptCode: conceptCode || undefined,
      items,
    });
  }
}
