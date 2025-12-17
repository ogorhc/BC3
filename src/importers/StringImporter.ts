import type { Importer } from './types/Importer.js';
import type { ImporterResult } from './types/ImporterResult.js';

export class StringImporter implements Importer<string> {
  async load(input: string): Promise<ImporterResult> {
    return {
      source: { type: 'string' },
      content: input,
    };
  }
}
