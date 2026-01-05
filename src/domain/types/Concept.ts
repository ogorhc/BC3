export type ConceptType = number | undefined;

/**
 * Concept represents a BC3 concept (unit, chapter, or item).
 *
 * This is a value object that holds identifying codes and descriptive/economic information.
 * It acts as a node in the hierarchical structure.
 */
export interface Concept {
  /** Code as it appears in the BC3 file (may include #/## prefixes) */
  code: string;
  /** Normalized code (without #/## prefixes) */
  codeNorm: string;
  /** Unit of measure */
  unit?: string;
  /** Summary/description */
  summary?: string;
  /** Prices array (from PRECIO\ subfields) */
  prices: number[];
  /** Dates array (from FECHA\ subfields) */
  dates: string[];
  /** Concept type (numeric code) */
  type?: ConceptType;
  /** Descriptive text (from ~T records) */
  text?: string;
}
