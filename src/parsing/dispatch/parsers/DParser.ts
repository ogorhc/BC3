import { isNonEmpty } from '../../../utils/strings';
import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { DecompositionInput, DecompositionLineInput } from './types/Parsers';
import { RecordParser } from './types/RecordParser';

function parsePorcentajes(sub: string[]): { codes?: string[]; raw?: string } {
  // Caso 1: el tokenizer dejó el 4º subcampo como "A;B;C"
  const raw = sub[3];
  if (isNonEmpty(raw)) {
    const codes = raw
      .split(';')
      .map((x) => x.trim())
      .filter(isNonEmpty);

    return { codes: codes.length ? codes : undefined, raw };
  }

  // Caso 2: el tokenizer pudo “partir” por \ y dejar varios subcampos extra
  // Ej: [code, factor, rend, "A", "B", "C"] o similares
  const tail = sub
    .slice(3)
    .map((x) => x.trim())
    .filter(isNonEmpty);
  if (tail.length) return { codes: tail, raw: undefined };

  return {};
}

export class DParser implements RecordParser {
  readonly type = 'D';

  parse(record: RawRecord, ctx: ParseContext): void {
    // ~D | CODIGO_PADRE | < CODIGO_HIJO \ [FACTOR] \ [REND] \ {COD_PORC;} > | ...
    const f = record.fields;

    const parent = f[0]?.[0]?.trim() ?? '';
    if (!parent) {
      ctx.diagnostics.push({
        level: 'warn',
        code: 'BC3_D_MISSING_PARENT',
        message: 'Record ~D without CODIGO_PADRE.',
        recordIndex: record.index,
        recordType: record.type,
      });
      return;
    }

    const lineFields = f.slice(1).filter((sub) => isNonEmpty(sub?.[0]));

    const lines: DecompositionLineInput[] = lineFields.map((sub) => {
      const code = sub[0]?.trim() ?? '';
      const factor = sub[1]?.trim();
      const performance = sub[2]?.trim();

      const { codes, raw } = parsePorcentajes(sub);

      return {
        code,
        factor: isNonEmpty(factor) ? factor : undefined,
        performance: isNonEmpty(performance) ? performance : undefined,
        percentagesCodes: codes,
        percentages: raw,
        raw: sub,
      };
    });

    const payload: DecompositionInput = { parent, lines };
    ctx.builder.onD(payload);
  }
}
