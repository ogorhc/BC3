import { ParseOptions, ParseResult } from '../api/types/PublicApi';
import { BC3Builder } from '../builder/BC3Builder';
import { Diagnostic } from '../domain';
import { ImporterSource } from '../importers';
import { DefaultTokenizer } from './DefaultTokenizer';
import { RecordDispatcher } from './dispatch/RecordDispatcher';
import { createParseContext } from './dispatch/createParseContext';
import { createDefaultParsers } from './dispatch/parsers/createDefaultParsers';

export function parseBC3(args: {
  source: ImporterSource;
  content: string;
  options: ParseOptions;
}): ParseResult {
  const diagnostics: Diagnostic[] = [];

  const tokenizer = new DefaultTokenizer();
  const records = tokenizer.tokenize(args.content, {
    lenient: (args.options.mode ?? 'lenient') !== 'strict',
    trimAroundSeparators: true,
  });

  const builder = new BC3Builder();
  builder.init({ source: args.source, raw: args.content, diagnostics });

  const ctx = createParseContext({
    builder,
    options: args.options,
    diagnostics,
  });

  const dispatcher = new RecordDispatcher(createDefaultParsers());
  dispatcher.dispatch(records, ctx);

  const store = ctx.builder.buildStore();
  return { store, diagnostics: ctx.diagnostics };
}
