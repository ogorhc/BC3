import { BC3ParseStore } from '../../builder/BC3ParseStore';
import { BC3Document, Diagnostic } from '../../domain';

export type ParseModel = 'strict' | 'lenient';

export interface ParseOptions {
  mode?: ParseModel;
}

export interface ParseResult {
  document?: BC3Document; // Phase 3
  store: BC3ParseStore; // Phase 2 output
  diagnostics: Diagnostic[];
}
