import { RawRecord } from './RawRecord';

export interface TokenizerOptions {
  /**
   * If true, trims whitespace (space, tab, CR, LF) around separators.
   * BC3 spec mandates ignoring whitespace *before* separators; trimming both
   * sides is practical and usually desired.
   */
  trimAroundSeparators?: boolean;

  /**
   * If true, emits records even if malformed (e.g. "~" without type).
   * The dispatcher/parsers can decide what to do later.
   */
  lenient?: boolean;
}

export interface TokenizerInterface {
  tokenize(input: string, options: TokenizerOptions): RawRecord[];
}
