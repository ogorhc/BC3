import { ParseOptions } from '../../../api/types/PublicApi';
import { BC3Builder } from '../../../builder/BC3Builder';
import { Diagnostic } from '../../../domain';

export type ParseMode = 'lenient' | 'strict';

export interface InternalParseOptions extends ParseOptions {
  mode?: ParseMode;
}

export interface ParseContext {
  options: InternalParseOptions;
  diagnostics: Diagnostic[];
  builder: BC3Builder;
}
