/**
 * Decomposition represents the decomposition of a concept into sub-concepts.
 *
 * It defines parent-child economic relationships with coefficients, factors, and percentages.
 */
export class Decomposition {
  /** Parent concept code (normalized) */
  readonly parentCode: string;
  /** Child concept code (normalized) */
  readonly childCode: string;
  /** Factor (multiplicador) */
  readonly factor?: number;
  /** Performance/rendement (rendimiento) */
  readonly performance?: number;
  /** Percentage codes (if percentages are used) */
  readonly percentageCodes?: string[];
  /** Raw percentage string (if percentages are used) */
  readonly percentageRaw?: string;

  constructor(args: {
    parentCode: string;
    childCode: string;
    factor?: number;
    performance?: number;
    percentageCodes?: string[];
    percentageRaw?: string;
  }) {
    this.parentCode = args.parentCode;
    this.childCode = args.childCode;
    this.factor = args.factor;
    this.performance = args.performance;
    this.percentageCodes = args.percentageCodes;
    this.percentageRaw = args.percentageRaw;
  }
}
