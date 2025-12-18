export type ConceptType = number | undefined;

export interface Concept {
  code: string; // tal como viene (puede llevar #/##)
  codeNorm: string; // normalizado (sin #/## al final)
  unit?: string;
  summary?: string;
  prices: number[]; // { PRECIO\ } -> array
  type?: ConceptType;
}
