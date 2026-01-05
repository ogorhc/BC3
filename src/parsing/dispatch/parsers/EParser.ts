import { RawRecord } from '../../types/RawRecord';
import { ParseContext } from '../types/ParseContext';
import { RecordParser } from './types/RecordParser';

/**
 * Parser for ~E records (Entity).
 *
 * Format:
 * ~E | CODIGO_ENTIDAD | [ RESUMEN ] | [ NOMBRE ] | { [ TIPO ] \ [ SUBNOMBRE ] \ [ DIRECCIÓN ] \ [ CP ] \ [ LOCALIDAD ] \ [ PROVINCIA ] \ [ PAIS ] \ { TELEFONO ; } \ { FAX; } \ { PERSONA_CONTACTO ; } \ } | [ CIF ] \ [ WEB ] \ [ EMAIL ] \ |
 */
export class EParser implements RecordParser {
  readonly type = 'E';

  parse(record: RawRecord, ctx: ParseContext): void {
    const f = record.fields;

    const entityCode = f[0]?.[0] ?? '';
    const summary = f[1]?.[0] ?? '';
    const name = f[2]?.[0] ?? '';

    // Field 3: contact details (subfields)
    const contactDetails = f[3] ?? [];
    const type = contactDetails[0];
    const subname = contactDetails[1];
    const address = contactDetails[2];
    const postalCode = contactDetails[3];
    const city = contactDetails[4];
    const province = contactDetails[5];
    const country = contactDetails[6];
    // Phones, faxes, contacts are separated by semicolons
    const phones = contactDetails[7]?.split(';').filter(Boolean) ?? [];
    const faxes = contactDetails[8]?.split(';').filter(Boolean) ?? [];
    const contacts = contactDetails[9]?.split(';').filter(Boolean) ?? [];

    // Field 4: identifiers
    const identifiers = f[4] ?? [];
    const cif = identifiers[0];
    const web = identifiers[1];
    const email = identifiers[2];

    if (!entityCode) {
      ctx.diagnostics.push({
        level: 'warn',
        code: 'BC3_E_MISSING_CODE',
        message: 'Record ~E without CODIGO_ENTIDAD.',
        recordIndex: record.index,
        recordType: record.type,
      });
      return;
    }

    ctx.builder.onE({
      entityCode,
      summary: summary || undefined,
      name: name || undefined,
      contact:
        type ||
        subname ||
        address ||
        postalCode ||
        city ||
        province ||
        country ||
        phones.length > 0 ||
        faxes.length > 0 ||
        contacts.length > 0
          ? {
              type: type || undefined,
              subname: subname || undefined,
              address: address || undefined,
              postalCode: postalCode || undefined,
              city: city || undefined,
              province: province || undefined,
              country: country || undefined,
              phones,
              faxes,
              contacts,
            }
          : undefined,
      cif: cif || undefined,
      web: web || undefined,
      email: email || undefined,
    });
  }
}
