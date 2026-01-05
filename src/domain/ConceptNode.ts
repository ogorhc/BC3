import { Attachment } from './Attachment';
import { Decomposition } from './Decomposition';
import { Measurement } from './Measurement';
import { Concept } from './types/Concept';

/**
 * ConceptNode represents a node in the hierarchical BC3 structure.
 *
 * It uses the Composite pattern to represent chapters, subchapters, and items uniformly.
 * Each node can have children (forming the hierarchy) and associated measurements,
 * decompositions, and attachments.
 */
export class ConceptNode {
  readonly concept: Concept;
  readonly children: ConceptNode[] = [];
  readonly measurements: Measurement[] = [];
  readonly decompositions: Decomposition[] = [];
  readonly attachments: Attachment[] = [];

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
}
