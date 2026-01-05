import { Attachment } from './Attachment';
import { Decomposition } from './Decomposition';
import { ITCodes } from './ITCode';
import { Measurement } from './Measurement';
import { Specification } from './Specification';
import { Thesaurus } from './Thesaurus';
import { Concept } from './types/Concept';

/**
 * ConceptNode represents a node in the hierarchical BC3 structure.
 *
 * It uses the Composite pattern to represent chapters, subchapters, and items uniformly.
 * Each node can have children (forming the hierarchy) and associated measurements,
 * decompositions, attachments, pliegos, IT codes, and thesaurus.
 */
export class ConceptNode {
  readonly concept: Concept;
  readonly children: ConceptNode[] = [];
  readonly measurements: Measurement[] = [];
  readonly decompositions: Decomposition[] = [];
  readonly attachments: Attachment[] = [];
  specification?: Specification;
  itCodes?: ITCodes;
  thesaurus?: Thesaurus;

  constructor(concept: Concept) {
    this.concept = concept;
  }

  /**
   * Adds a child node to this node.
   */
  addChild(node: ConceptNode): void {
    this.children.push(node);
  }

  /**
   * Adds a measurement to this node.
   */
  addMeasurement(measurement: Measurement): void {
    this.measurements.push(measurement);
  }

  /**
   * Adds a decomposition to this node.
   */
  addDecomposition(decomposition: Decomposition): void {
    this.decompositions.push(decomposition);
  }

  /**
   * Adds an attachment to this node.
   */
  addAttachment(attachment: Attachment): void {
    this.attachments.push(attachment);
  }

  /**
   * Sets the specification for this node.
   */
  setSpecification(specification: Specification): void {
    this.specification = specification;
  }

  /**
   * Sets the IT codes for this node.
   */
  setITCodes(itCodes: ITCodes): void {
    this.itCodes = itCodes;
  }

  /**
   * Sets the thesaurus for this node.
   */
  setThesaurus(thesaurus: Thesaurus): void {
    this.thesaurus = thesaurus;
  }
}
