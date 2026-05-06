/**
 * CostOverride represents a geographic cost adjustment from a ~O record.
 *
 * Each ~O record associates a concept with location-specific price overrides.
 */
export class CostOverride {
  /** Concept code (normalized) */
  readonly conceptCode: string;
  /** Location-price pairs */
  readonly locations: CostLocation[];

  constructor(args: { conceptCode: string; locations: CostLocation[] }) {
    this.conceptCode = args.conceptCode;
    this.locations = args.locations;
  }
}

export interface CostLocation {
  location: string;
  price: number;
}
