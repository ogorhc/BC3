import { BC3Document, Diagnostic } from '../../domain';

export type ParseModel = 'strict' | 'lenient';

export interface ParseOptions {
  mode?: ParseModel;
}

export interface ParseResult {
  document: BC3Document;
  diagnostics: Diagnostic[];
}
