import { ConceptNode } from './ConceptNode';
import { Diagnostic } from './types';

/**
 * BC3Document represents a complete parsed BC3 file.
 * It's the root aggregate of the domain model.
 */
export class BC3Document {
  /** Metadata from ~V record */
  readonly metadata?: {
    property?: string;
    version?: string;
    versionDate?: string;
    program?: string;
    header?: string;
    labels?: string[];
    charset?: string;
    comment?: string;
    infoType?: string;
    certificateNumber?: string;
    certificateDate?: string;
    baseUrl?: string;
  };

  /** Root nodes of the hierarchy */
  readonly roots: ConceptNode[];

  /** Map of normalized codes to ConceptNode for lookup */
  readonly conceptsByCode: Map<string, ConceptNode>;

  /** Diagnostics collected during parsing */
  readonly diagnostics: Diagnostic[];

  constructor(args: {
    metadata?: BC3Document['metadata'];
    roots: ConceptNode[];
    conceptsByCode: Map<string, ConceptNode>;
    diagnostics: Diagnostic[];
  }) {
    this.metadata = args.metadata;
    this.roots = args.roots;
    this.conceptsByCode = args.conceptsByCode;
    this.diagnostics = args.diagnostics;
  }
}
