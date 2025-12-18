import { ImporterSource } from '../../importers';
import {
  ConceptInput,
  DecompositionLineInput,
  KDecimalsInput,
  MeasurementInput,
  VersionPropertyInput,
} from '../../parsing/dispatch/parsers/types/Parsers';
import { Diagnostic } from '../../domain/types/Diagnostic';

export interface BC3ParseStoreData {
  source: ImporterSource | null;
  raw: string | null;
  diagnostics: Diagnostic[] | null;

  meta?: VersionPropertyInput;
  decimals?: KDecimalsInput;

  concepts: Map<string, ConceptInput>;
  decompositions: Map<string, DecompositionLineInput[]>;
  texts: Map<string, string>;
  measurements: MeasurementInput[];
}
