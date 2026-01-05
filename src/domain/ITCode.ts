/**
 * ITCode represents an Item/IT code (código de item).
 */
export class ITCode {
  readonly itCode: string;
  readonly description?: string;
  readonly unit?: string;
  readonly value?: string;

  constructor(args: {
    itCode: string;
    description?: string;
    unit?: string;
    value?: string;
  }) {
    this.itCode = args.itCode;
    this.description = args.description;
    this.unit = args.unit;
    this.value = args.value;
  }
}

/**
 * ITCodes represents IT codes for a concept or as a dictionary.
 */
export class ITCodes {
  readonly conceptCode?: string; // undefined = dictionary mode
  readonly items: ITCode[];

  constructor(args: { conceptCode?: string; items: ITCode[] }) {
    this.conceptCode = args.conceptCode;
    this.items = args.items;
  }
}
