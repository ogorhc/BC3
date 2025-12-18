import type { ParseOptions } from '../../api/types/PublicApi';
import type { Diagnostic } from '../../domain';
import { BC3Builder } from '../../builder/BC3Builder';
import { ParseContext } from './types/ParseContext';

export function createParseContext(args: {
  builder: BC3Builder;
  options: ParseOptions;
  diagnostics?: Diagnostic[];
}): ParseContext {
  return {
    options: { mode: args.options.mode ?? 'lenient' },
    diagnostics: args.diagnostics ?? [],
    builder: args.builder,
  };
}
