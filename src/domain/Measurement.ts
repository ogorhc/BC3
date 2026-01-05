/**
 * MeasurementDetail represents a single measurement detail line.
 */
export interface MeasurementDetail {
  /** Measurement type (TIPO) */
  type?: string;
  /** Comment (may include #ID_BIM references) */
  comment?: string;
  /** Extracted BIM IDs from comment */
  bimIds?: string[];
  /** Units (U) */
  units?: string;
  /** Length (L) */
  length?: number;
  /** Latitude/width (La) */
  latitude?: number;
  /** Height (A) */
  height?: number;
}

/**
 * Measurement represents measurement data associated with a concept.
 *
 * It stores quantities, expressions, subtotals, and optional labels (ETIQUETA).
 */
export class Measurement {
  /** Concept code this measurement belongs to (normalized) */
  readonly conceptCode: string;
  /** Parent code if this is a child measurement (PADRE\HIJO format) */
  readonly parentCode?: string;
  /** Positions array */
  readonly positions: string[];
  /** Total value */
  readonly total?: number;
  /** Measurement details */
  readonly details: MeasurementDetail[];
  /** Optional label (ETIQUETA) */
  readonly label?: string;

  constructor(args: {
    conceptCode: string;
    parentCode?: string;
    positions: string[];
    total?: number;
    details: MeasurementDetail[];
    label?: string;
  }) {
    this.conceptCode = args.conceptCode;
    this.parentCode = args.parentCode;
    this.positions = args.positions;
    this.total = args.total;
    this.details = args.details;
    this.label = args.label;
  }
}
