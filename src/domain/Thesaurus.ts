/**
 * Thesaurus represents thesaurus keys associated with a concept.
 */
export class Thesaurus {
  readonly conceptCode: string;
  readonly keys: string[];

  constructor(args: { conceptCode: string; keys: string[] }) {
    this.conceptCode = args.conceptCode;
    this.keys = args.keys;
  }
}
