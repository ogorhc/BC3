export interface RawRecord {
  /** Record type letter after "~" (e.g. "V", "C", "D", "M") */
  type: string;
  /** 0-based sequential index in the source */
  index: number;
  /** Raw record text including leading "~" (useful for debugging) */
  raw: string;
  /**
   * Fields split by "|", and each field split by "\" into subfields.
   * Example: fields[3] is the 4th field; fields[3][0] is the 1st subfield.
   */
  fields: string[][];
}
