import { BC3Document, Diagnostic } from '../../domain';

export type ParseModel = 'strict' | 'lenient';

export interface ParseOptions {
  mode?: ParseModel;
}

export interface ParseResult {
  /** The parsed BC3 document (domain model) */
  document?: BC3Document;
  /** Diagnostics collected during parsing (warnings, errors, info) */
  diagnostics: Diagnostic[];
}
