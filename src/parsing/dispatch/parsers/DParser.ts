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

  private looksLikeChildCode(elem: string, inPerfSlot = false): boolean {
    if (inPerfSlot) {
      // In the performance (REND) slot the value is always a quantity.
      // Reject all numeric patterns so that large integer performances
      // (e.g. 6990, 1173) and decimal performances (e.g. 0.76, 1.5) do
      // NOT trigger the ARQUIMEDES "skip perf slot" path.
      // Only non-numeric strings in this slot (i.e. an actual concept code)
      // should cause the slot to be skipped — that is the ARQUIMEDES pattern
      // where the perf slot is absent and the next child code lands here.
      if (/^[\d.]+$/.test(elem)) return false;
    }

    // Percentage codes.
    if (elem.startsWith('%')) return true;

    // Dotted codes: covers chapter codes like 2.2, 2.10, 3.5.1 AND
    // alphanumeric dotted codes like I.LT04.01, WORKER.1a.
    // In the lookahead context decimal performance values (e.g. 0.76) also
    // match here, but since they won't match any ~C concept they produce a
    // BC3_D_MISSING_CHILD_CODE diagnostic and are skipped — which is the
    // correct lenient-mode behaviour (no silent data loss).
    if (elem.includes('.')) return true;

    // Alphanumeric codes (letters + digits).
    if (/[a-zA-Z]/.test(elem) && /\d/.test(elem)) return true;

    // Pure-letter codes.
    if (/^[a-zA-Z]/.test(elem)) return true;

    // Pure integers: valid numeric concept codes (e.g. 1001, 311100).
    if (/^\d+$/.test(elem)) return true;

    return false;
  }

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

    // In BC3, a ~D record can have multiple children in a single field.
    // Format: ~D | PARENT | CHILD1\FACTOR1\REND1\ CHILD2\FACTOR2\REND2\ ... |
    // The tokenizer splits by \ so we get a flat array: [CHILD1, FACTOR1, REND1, CHILD2, FACTOR2, REND2, ...]
    // We need to group them in triplets: (code, factor, performance)
    const allFields = f.slice(1);
    const lines: DecompositionLineInput[] = [];

    for (const field of allFields) {
      if (!field || field.length === 0) continue;

      // Process the field in groups of 3: (code, factor, performance)
      // Format: CODE\FACTOR\REND\CODE\FACTOR\REND\...
      // After REND, there might be percentage codes before the next CODE
      let i = 0;
      while (i < field.length) {
        const code = field[i]?.trim() ?? '';
        if (!code) {
          i++;
          continue;
        }

        const factor = field[i + 1]?.trim();
        let performance = field[i + 2]?.trim();

        // When the performance slot contains a child code (e.g. ARQUIMEDES
        // multiline format omits performance values), back up so the next
        // iteration picks it up as the next child's code.
        let skipPerfSlot = false;
        if (
          isNonEmpty(performance) &&
          this.looksLikeChildCode(performance, true)
        ) {
          performance = undefined;
          skipPerfSlot = true;
        }

        // Look ahead to find where the next child code starts
        // The next child code will be at position i+3+N where N is the number of percentage codes
        // Percentage codes are typically alphanumeric (like "MEDAUX", "CI") or have special format
        // Child codes are either numeric (like "311100") or have dots (like "I.LT04.01")
        let percentageEnd = skipPerfSlot ? i + 2 : i + 3;
        const percentageSub: string[] = [];

        // Collect percentage codes until we find the next child code
        while (percentageEnd < field.length) {
          const elem = field[percentageEnd]?.trim();
          if (!elem) break;

          // Check if this element looks like a child code
          if (this.looksLikeChildCode(elem)) {
            // This is the next child code, stop collecting percentage codes
            break;
          }

          // This looks like a percentage code
          percentageSub.push(elem);
          percentageEnd++;
        }

        const { codes, raw } = parsePorcentajes(
          percentageSub.length > 0 ? ['', '', '', ...percentageSub] : [],
        );

        lines.push({
          code,
          factor: isNonEmpty(factor) ? factor : undefined,
          performance: isNonEmpty(performance) ? performance : undefined,
          percentagesCodes: codes,
          percentagesRaw: raw,
          raw: field.slice(i, percentageEnd),
        });

        // Move to next triplet: code + factor + performance + percentage codes
        i = percentageEnd;
      }
    }

    const payload: DecompositionInput = { parent, lines };
    ctx.builder.onD(payload);
  }
}
