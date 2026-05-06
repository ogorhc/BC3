/**
 * MeasurementDetail represents a single measurement detail line.
 */
export class MeasurementDetail {
  /** Measurement type (TIPO) */
  readonly type?: string;
  /** Comment (may include #ID_BIM references) */
  readonly comment?: string;
  /** Extracted BIM IDs from comment */
  readonly bimIds?: string[];
  /** Units (U) parsed as factor — defaults to 1 if unset */
  readonly units?: number;
  /** Length (L) */
  readonly length?: number;
  /** Latitude/width (La) */
  readonly latitude?: number;
  /** Height (A) */
  readonly height?: number;
  /** Computed partial measurement: length * latitude * height * units + constant */
  readonly partial: number;

  constructor(args: {
    type?: string;
    comment?: string;
    bimIds?: string[];
    units?: number;
    length?: number;
    latitude?: number;
    height?: number;
    partial: number;
  }) {
    this.type = args.type;
    this.comment = args.comment;
    this.bimIds = args.bimIds;
    this.units = args.units;
    this.length = args.length;
    this.latitude = args.latitude;
    this.height = args.height;
    this.partial = args.partial;
  }
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
