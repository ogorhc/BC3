import { ImporterSource } from '../../importers';
import {
  AInput,
  ConceptInput,
  DecompositionLineInput,
  EInput,
  KDecimalsInput,
  LInput,
  MeasurementInput,
  VersionPropertyInput,
  XInput,
} from '../../parsing/dispatch/parsers/types/Parsers';
import { Diagnostic } from '../../domain/types/Diagnostic';
import { ParseNode } from '../store/ParseNode';

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

  // Phase 5: Extended records
  pliegos: Map<string, LInput>;
  pliegosDictionary?: LInput;
  itCodes: Map<string, XInput>;
  itCodesDictionary?: XInput;
  entities: Map<string, EInput>;
  thesaurus: Map<string, AInput>;

  nodes?: Map<string, ParseNode>;
  roots?: string[];
}
