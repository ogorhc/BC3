import { ParseOptions, ParseResult } from '../api/types/PublicApi';
import { BC3Builder } from '../builder/BC3Builder';
import { DomainAssembler } from '../builder/assemblers/DomainAssembler';
import { Diagnostic } from '../domain';
import { ImporterSource } from '../importers';
import { Tokenizer } from './Tokenizer';
import { RecordDispatcher } from './dispatch/RecordDispatcher';
import { createParseContext } from './dispatch/createParseContext';
import { createDefaultParsers } from './dispatch/parsers/createDefaultParsers';

export function parseBC3(args: {
  source: ImporterSource;
  content: string;
  options: ParseOptions;
}): ParseResult {
  const diagnostics: Diagnostic[] = [];

  const tokenizer = new Tokenizer();
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

  // Build parse store (parsing layer ends here)
  const store = ctx.builder.buildStore();

  // Build domain document (domain layer starts here)
  // This happens AFTER hierarchy is assembled in buildStore()
  const document = DomainAssembler.buildDocument(store);

  return { document, store, diagnostics: ctx.diagnostics };
}
