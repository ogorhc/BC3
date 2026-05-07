/**
 * Per-record-type counts from the raw BC3 input.
 *
 * Every record processed by the dispatcher increments the corresponding
 * counter.  Unknown record types increment `unknown`.
 */
export interface RecordCounts {
  V: number;
  C: number;
  D: number;
  T: number;
  M: number;
  N: number;
  L: number;
  X: number;
  E: number;
  A: number;
  O: number;
  K: number;
  Y: number;
  G: number;
  unknown: number;
}

export function zeroRecordCounts(): RecordCounts {
  return {
    V: 0,
    C: 0,
    D: 0,
    T: 0,
    M: 0,
    N: 0,
    L: 0,
    X: 0,
    E: 0,
    A: 0,
    O: 0,
    K: 0,
    Y: 0,
    G: 0,
    unknown: 0,
  };
}

/**
 * High-level summary of a parsed BC3 document.
 *
 * Computed by {@link BC3Document.getSummary}.  Includes file metadata,
 * raw record counts, and aggregated statistics about concepts,
 * measurements, decompositions, and auxiliary data.
 */
export interface DocumentSummary {
  metadata?: {
    property?: string;
    version?: string;
    versionDate?: string;
    program?: string;
    header?: string;
    charset?: string;
  };

  recordCounts: RecordCounts;

  /** Total number of unique concepts. */
  totalConcepts: number;
  /** Number of root concepts (no parent). */
  rootConcepts: number;
  /** Number of leaf concepts (no children). */
  leafConcepts: number;
  /** Maximum depth of the concept tree. */
  maxDepth: number;
  /** Concept type distribution (type → count). */
  conceptTypeDistribution: Map<number, number>;

  /** Number of concepts that have at least one measurement. */
  conceptsWithMeasurements: number;
  /** Sum of all MeasurementDetail lines across all measurements. */
  totalMeasurementLines: number;

  /** Total number of decomposition lines (parent-child links). */
  totalDecompositions: number;
  /** Number of concepts that have at least one decomposition line. */
  conceptsWithDecompositions: number;

  /** Number of concepts with specification (~L) data. */
  specifications: number;
  /** Whether a standalone specifications dictionary exists. */
  hasSpecificationsDictionary: boolean;

  /** Number of concepts with IT code (~X) data. */
  itCodes: number;
  /** Whether a standalone IT codes dictionary exists. */
  hasItCodesDictionary: boolean;

  /** Number of concepts with thesaurus (~A) data. */
  thesaurusEntries: number;

  /** Number of entities (~E records). */
  entities: number;

  /** Number of cost overrides (~O records). */
  costOverrides: number;

  /** Number of attachments (~G records). */
  attachments: number;

  /** Diagnostic severity breakdown. */
  diagnostics: {
    info: number;
    warn: number;
    error: number;
  };
}
