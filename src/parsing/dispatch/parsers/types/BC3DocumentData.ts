import { ImporterSource } from '../../../../importers';
import {
  ConceptInput,
  DecompositionLineInput,
  KDecimalsInput,
  MeasurementInput,
  VersionPropertyInput,
} from './Parsers';
import { Diagnostic } from '../../../../domain/types/Diagnostic';

export interface BC3DocumentData {
  source: ImporterSource;
  raw: string;
  diagnostics: Diagnostic[];

  meta?: VersionPropertyInput;
  decimals?: KDecimalsInput;

  concepts: Map<string, ConceptInput>;
  decompositions: Map<string, DecompositionLineInput[]>;
  texts: Map<string, string>;
  measurements: MeasurementInput[];
}
