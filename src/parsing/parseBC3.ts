import type { ParseOptions } from '../api/types/PublicApi';
import { BC3Builder } from '../builder/BC3Builder';
import { DomainAssembler } from '../builder/assemblers/DomainAssembler';
import type { BC3Document, Diagnostic } from '../domain';
import type { ImporterSource } from '../importers';
import { Tokenizer } from './Tokenizer';
import { RecordDispatcher } from './dispatch/RecordDispatcher';
import { createParseContext } from './dispatch/createParseContext';
import { createDefaultParsers } from './dispatch/parsers/createDefaultParsers';

interface InternalParseResult {
  document?: BC3Document;
  diagnostics: Diagnostic[];
}

function isLenientMode(options: ParseOptions): boolean {
  return (options.mode ?? 'lenient') !== 'strict';
}

function tokenizeRecords(content: string, options: ParseOptions) {
  const tokenizer = new Tokenizer();
  return tokenizer.tokenize(content, {
    lenient: isLenientMode(options),
    trimAroundSeparators: true,
  });
}

function buildContext(args: {
  builder: BC3Builder;
  options: ParseOptions;
  diagnostics: Diagnostic[];
}) {
  return createParseContext({
    builder: args.builder,
    options: args.options,
    diagnostics: args.diagnostics,
  });
}

function dispatchRecords(
  ctx: ReturnType<typeof createParseContext>,
  records: ReturnType<Tokenizer['tokenize']>,
) {
  const dispatcher = new RecordDispatcher(createDefaultParsers());
  dispatcher.dispatch(records, ctx);
}

function assembleDocument(builder: BC3Builder) {
  const store = builder.buildStore();
  return DomainAssembler.buildDocument(store);
}

/**
 * Internal parsing function. Not part of the public API.
 * Use BC3.parse() instead.
 */
export function parseBC3Internal(args: {
  source: ImporterSource;
  content: string;
  options: ParseOptions;
}): InternalParseResult {
  const diagnostics: Diagnostic[] = [];

  const records = tokenizeRecords(args.content, args.options);

  const builder = new BC3Builder();
  builder.init({ source: args.source, raw: args.content, diagnostics });

  const ctx = buildContext({ builder, options: args.options, diagnostics });

  dispatchRecords(ctx, records);

  const document = assembleDocument(ctx.builder);

  return { document, diagnostics: ctx.diagnostics };
}

/** @deprecated Use BC3.parse() instead */
export function parseBC3(args: {
  source: ImporterSource;
  content: string;
  options: ParseOptions;
}): InternalParseResult {
  return parseBC3Internal(args);
}
