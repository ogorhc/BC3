import type { ParseOptions, ParseResult } from './types/PublicApi.js';
import { parseBC3 } from '../parsing/parseBC3.js';

export class BC3 {
  static parse(input: string, options: ParseOptions = {}): ParseResult {
    //TODO: Implement strategies for different input types
    return parseBC3({
      source: { type: 'string' },
      content: input,
      options,
    });
  }
}
