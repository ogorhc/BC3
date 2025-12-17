import { ImporterSource } from '../importers';
import { Diagnostic } from './types';

export class BC3Document {
  readonly source: ImporterSource;
  readonly raw: string;
  readonly diagnostics: Diagnostic[];

  constructor(args: {
    source: ImporterSource;
    raw: string;
    diagnostics?: Diagnostic[];
  }) {
    this.source = args.source;
    this.raw = args.raw;
    this.diagnostics = args.diagnostics ?? [];
  }
}
