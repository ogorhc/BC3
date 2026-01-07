import { parseBC3Internal } from '../parsing/parseBC3';
import type { ParseOptions, ParseResult } from './types/PublicApi';

/**
 * Main BC3 library façade.
 *
 * Provides a clean, stable API for parsing BC3 (FIEBDC-3) files.
 */
export class BC3 {
  /**
   * Parses a BC3 text input and returns a structured result with the domain model and diagnostics.
   *
   * @param input - Raw BC3 text content
   * @param options - Parsing options (mode, etc.)
   * @returns ParseResult with document and diagnostics
   *
   * @example
   * ```typescript
   * const result = BC3.parse(bc3Text, { mode: 'lenient' });
   * if (result.document) {
   *   console.log(`Parsed ${result.document.roots.length} root concepts`);
   * }
   * ```
   */
  static parse(input: string, options: ParseOptions = {}): ParseResult {
    const result = parseBC3Internal({
      source: { type: 'string' },
      content: input,
      options,
    });

    // Return only public API surface
    const publicResult: ParseResult = {
      document: result.document,
      diagnostics: result.diagnostics,
    };

    return publicResult;
  }
}
