/**
 * Coefficients represents the cost coefficient configuration from a ~K record.
 *
 * The FIEBDC-3 spec defines two coefficient layouts:
 * - legacy (fields[0]): DN, DD, DI, GG, BI, BAJA, IVA, DIVISA
 * - full (fields[2]): DRC, DC, DN, DD, DI, GG, BI, BAJA, IVA, DIVISA, ...
 */
export class Coefficients {
  /** Legacy coefficient subfields from ~K field 0 */
  readonly legacy: string[];
  /** Full coefficient subfields from ~K field 2 */
  readonly full: string[];
  /** Raw ~K record text */
  readonly raw: string;

  constructor(args: { legacy: string[]; full: string[]; raw: string }) {
    this.legacy = args.legacy;
    this.full = args.full;
    this.raw = args.raw;
  }
}
