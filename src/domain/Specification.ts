/**
 * SpecificationSection represents a section in a specification document.
 */
export class SpecificationSection {
  readonly sectionCode: string;
  readonly sectionLabel?: string;
  readonly text?: string;
  readonly rtfFile?: string;
  readonly htmFile?: string;

  constructor(args: {
    sectionCode: string;
    sectionLabel?: string;
    text?: string;
    rtfFile?: string;
    htmFile?: string;
  }) {
    this.sectionCode = args.sectionCode;
    this.sectionLabel = args.sectionLabel;
    this.text = args.text;
    this.rtfFile = args.rtfFile;
    this.htmFile = args.htmFile;
  }
}

/**
 * Specification represents specification document data for a concept or as a dictionary.
 */
export class Specification {
  readonly conceptCode?: string; // undefined = dictionary mode
  readonly sections: SpecificationSection[];

  constructor(args: {
    conceptCode?: string;
    sections: SpecificationSection[];
  }) {
    this.conceptCode = args.conceptCode;
    this.sections = args.sections;
  }
}
