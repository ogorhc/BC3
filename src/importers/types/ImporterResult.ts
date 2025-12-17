import { ImporterSource } from './Sources';

export interface ImporterResult {
  source: ImporterSource;
  content: string;
}
