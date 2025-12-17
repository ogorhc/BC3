import { ParseOptions, ParseResult } from '../api/types/PublicApi';
import { BC3Document, Diagnostic } from '../domain';
import { ImporterSource } from '../importers';

//TODO: Implement tokenizer, dispatcher, and strategies
export function parseBC3(args: {
  source: ImporterSource;
  content: string;
  options: ParseOptions;
}): ParseResult {
  const diagnostics: Diagnostic[] = [];

  if (!args.content.includes('~')) {
    diagnostics.push({
      level: 'warn',
      code: 'BC3_NO_RECORD_DELIMITER',
      message: 'Input does not contain any "~" record delimiter.',
    });
  }

  const document = new BC3Document({
    source: args.source,
    raw: args.content,
    diagnostics,
  });

  return { document, diagnostics };
}
