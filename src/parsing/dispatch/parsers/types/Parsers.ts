export type DiagnosticLevel = 'info' | 'warn' | 'error';

export interface VersionPropertyInput {
  property: string;
  version: string;
  versionDate: string;
  program: string;
  header: string;
  labels: string[];
  charset: string;
  comment: string;
  infoType: string;
  certificateNumber: string;
  certificateDate: string;
  baseUrl: string;
}

export interface KDecimalsInput {
  legacy: string[];
  full: string[];
  raw: string;
}

export interface ConceptInput {
  code: string; // primary code
  codes: string[]; // aliases
  unit: string;
  summary: string;
  prices: string[];
  dates: string[];
  type: string;
}

export interface DecompositionLineInput {
  code: string;
  factor?: string;
  performance?: string;
  percentagesCodes?: string[];
  percentagesRaw?: string;
  raw: string[];
}

export interface DecompositionInput {
  parent: string;
  lines: DecompositionLineInput[];
}

export interface TextInput {
  code: string;
  text: string;
}

export interface MeasurementDetailInput {
  type?: string; // TIPO
  comment?: string; // COMENTARIO (puede incluir #ID_BIM)
  bimIds?: string[]; // extraídos del comment si quieres
  units?: string; // U
  length?: string; // L
  latitude?: string; // La
  height?: string; // A
  raw: string[]; // subcampos originales
}

export interface MeasurementInput {
  rawCode: string; // puede ser PADRE\HIJO o HIJO
  positions: string[];
  total?: string;
  details: MeasurementDetailInput[];
  label?: string;
  rawFields: string[][];
}

export interface CodeChangeInput {
  from: string;
  to?: string; // undefined => “eliminar/no definido”
  rawFields: string[][];
}
