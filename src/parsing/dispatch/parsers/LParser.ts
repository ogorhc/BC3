import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { SpecificationSectionInput } from './types/Parsers';
import { RecordParser } from './types/RecordParser';

/**
 * Parser for ~L records (Pliegos sections).
 *
 * Format:
 * ~L | | < CODIGO_SECCION_PLIEGO \ [ ROTULO_SECCION_PLIEGO ] \ > |
 * ~L | CODIGO_CONCEPTO | { CODIGO_SECCION_PLIEGO \ TEXTO_SECCION_PLIEGO \ } | { CODIGO_SECCION_PLIEGO \ ARCHIVO_TEXTO_RTF \ } | { CODIGO_SECCION_PLIEGO \ ARCHIVO_TEXTO_HTM \ } |
 */
export class LParser implements RecordParser {
  readonly type = 'L';

  parse(record: RawRecord, ctx: ParseContext): void {
    const f = record.fields;

    // Field 0: empty or CODIGO_CONCEPTO
    const conceptCode = f[0]?.[0] ?? '';

    // Field 1: sections (can be dictionary or concept sections)
    const sectionsRaw = f[1] ?? [];
    const sections: SpecificationSectionInput[] = [];

    // Parse sections: each section is a group of subfields
    // Format: CODIGO_SECCION \ ROTULO | TEXTO | RTF | HTM
    for (let i = 0; i < sectionsRaw.length; i += 5) {
      const sectionCode = sectionsRaw[i] ?? '';
      if (!sectionCode) continue;

      const section: SpecificationSectionInput = {
        sectionCode,
        sectionLabel: sectionsRaw[i + 1],
        text: sectionsRaw[i + 2],
        rtfFile: sectionsRaw[i + 3],
        htmFile: sectionsRaw[i + 4],
      };

      sections.push(section);
    }

    ctx.builder.onL({
      conceptCode: conceptCode || undefined,
      sections,
    });
  }
}
