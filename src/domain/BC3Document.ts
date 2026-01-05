import { Attachment } from './Attachment';
import { ConceptNode } from './ConceptNode';
import { Diagnostic } from './types';

/**
 * DocumentMetadata represents metadata from ~V records.
 */
export interface DocumentMetadata {
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
}

/**
 * BC3Document represents a complete parsed BC3 file.
 *
 * It's the root aggregate of the domain model and provides access to:
 * - Global metadata
 * - All parsed concepts in a hierarchical structure
 * - Attachments and resources
 * - Diagnostics collected during parsing
 */
export class BC3Document {
  /** Metadata from ~V record */
  readonly metadata?: DocumentMetadata;

  /** Root nodes of the hierarchy */
  readonly roots: ConceptNode[];

  /** Map of normalized codes to ConceptNode for lookup */
  readonly conceptsByCode: Map<string, ConceptNode>;

  /** Global attachments (not tied to specific concepts) */
  readonly attachments: Attachment[];

  /** Diagnostics collected during parsing */
  readonly diagnostics: Diagnostic[];

  constructor(args: {
    metadata?: DocumentMetadata;
    roots: ConceptNode[];
    conceptsByCode: Map<string, ConceptNode>;
    attachments?: Attachment[];
    diagnostics: Diagnostic[];
  }) {
    this.metadata = args.metadata;
    this.roots = args.roots;
    this.conceptsByCode = args.conceptsByCode;
    this.attachments = args.attachments ?? [];
    this.diagnostics = args.diagnostics;
  }

  /**
   * Gets a concept node by its normalized code.
   */
  getConcept(code: string): ConceptNode | undefined {
    return this.conceptsByCode.get(code);
  }

  /**
   * Gets all concepts that match a predicate.
   */
  findConcepts(predicate: (node: ConceptNode) => boolean): ConceptNode[] {
    const results: ConceptNode[] = [];
    for (const node of this.conceptsByCode.values()) {
      if (predicate(node)) {
        results.push(node);
      }
    }
    return results;
  }
}
