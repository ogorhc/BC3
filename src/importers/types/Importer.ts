import { ImporterResult } from './ImporterResult';
import { ImporterSource } from './Sources';

export abstract class Importer<TInput> {
  abstract load(source: TInput): Promise<ImporterResult>;
}
