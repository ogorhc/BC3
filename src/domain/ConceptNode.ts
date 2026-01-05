import { Concept } from './types/Concept';

export class ConceptNode {
  readonly concept: Concept;
  readonly children: ConceptNode[] = [];

  constructor(concept: Concept) {
    this.concept = concept;
  }

  addChild(node: ConceptNode) {
    this.children.push(node);
  }
}
