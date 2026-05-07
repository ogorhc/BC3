# BC3 Parser

Skills and constraints for modifying the BC3 parsing pipeline: tokenizer, record parsers, builder, or domain assembler.

## When to Use

- Modifying any stage of the parsing pipeline
- Adding a new record type parser
- Changing tokenizer behavior (record boundaries, field splitting, whitespace)
- Extending the builder (BC3ParseStore, DomainAssembler)
- Changing parser behavior in strict or lenient mode

## Critical Rules

### Fixture requirement (hard)

**Never modify parser behavior without a fixture-based test.** Before changing any parser, tokenizer, or domain assembler:

1. Create a BC3 string fixture that exercises the target behavior
2. Verify the fixture produces the expected output (or error) with the current parser
3. Commit the fixture alongside the code change

Fixture format (tests use `node:test` + `tsx`; run with `npm test`):

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BC3 } from '../../api/BC3.js';

describe('MyParser', () => {
  it('handles edge case X', () => {
    const fixture = `~V|TEST|FIEBDC-3/2020|Test||ANSI|
~C|01||Test concept|100.00|010120|0|
~D|01|02.01\\1\\2.5||`;
    const result = BC3.parse(fixture);
    assert.equal(result.diagnostics.length, 0);
    // ... assertions
  });
});
```

### Preserve unknown records

UnknownRecordParser must capture and preserve unknown record types, not discard them. The parsed content should be available for inspection in the parse result or diagnostics.

### Edge case documentation (required)

Every parser behavior change must update `docs/bc3-knowledge/known-edge-cases.md` if the change addresses, introduces, or touches an edge case.

### No BC3 file modification

Files under `data/bc3-corpus/samples/` are reference material. Test with string fixtures, not by modifying corpus files.

## Parser Architecture

### Adding a new record type

1. Add parser class in `src/parsing/dispatch/parsers/` implementing `RecordParser`
2. Register in `src/parsing/dispatch/parsers/createDefaultParsers.ts`
3. Add type to `src/parsing/dispatch/types/Parsers.ts`
4. Extend `BC3ParseStoreData` in `src/builder/types/BC3ParseStoreData.ts`
5. Extend `DomainAssembler` in `src/builder/assemblers/DomainAssembler.ts`
6. Extend domain types if needed (must remain pure — no parsing deps)

### Parser interface

All parsers implement `RecordParser` from `src/parsing/dispatch/types/RecordParser.ts`:

```typescript
interface RecordParser {
  readonly recordType: string;
  parse(record: RawRecord, ctx: ParseContext): ParseResult;
}
```

### Strict vs lenient

- `'lenient'` (default): collect `Diagnostic` objects, continue on errors
- `'strict'`: throw on first error

When adding a parser, handle both modes. Unknown records produce diagnostics in both modes.

## Tokenizer Constraints

The tokenizer (`src/parsing/Tokenizer.ts`) operates on raw strings. Key behaviors to preserve:

- Record delimiter: `~` at line start
- Field separator: `|` (pipe)
- Subfield separator: `\\` (double backslash); single `\` is literal
- Whitespace: trimmed at field/subfield edges, preserved internally
- EOF marker: `\x1a` (Ctrl+Z) stripped

### Known gaps (do not worsen)

- ISO-8859-1 encoding — corpus files are Latin-1, not UTF-8
- Multiline ~D records — ARQUIMEDES generator emits continuation lines without `~` prefix
- Null byte contamination — some files contain `\x00`
- Backslash ambiguity — `\` used as subfield separator, version date separator, and path separator

## Builder Constraints

- `BC3ParseStore` is an intermediate store — no domain logic here
- `DomainAssembler` converts store → domain — no parsing logic here
- Domain types must remain pure — no imports from parsing/builder

## Verification

After any parser change:

```bash
npm run ci              # build + format
npm run dev:tokenize    # smoke test with scripts/file.bc3
```

If the change touches a supported edge case, verify the relevant corpus file still parses correctly (via manual smoke test or fixture comparison).

## Related Skills

- `bc3-corpus-analysis` — for analyzing the impact of parser changes on the corpus
- `bc3-development` — general project development conventions
