import { Attachment } from './Attachment';
import { ConceptNode } from './ConceptNode';
import { Entity } from './Entity';
import { ITCodes } from './ITCode';
import { Specification } from './Specification';
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

  /** Entities (companies, persons, etc.) */
  readonly entities: Map<string, Entity>;

  /** Specifications dictionary (sections definitions) */
  readonly specificationsDictionary?: Specification;

  /** IT codes dictionary (IT codes definitions) */
  readonly itCodesDictionary?: ITCodes;

  /** Diagnostics collected during parsing */
  readonly diagnostics: Diagnostic[];

  constructor(args: {
    metadata?: DocumentMetadata;
    roots: ConceptNode[];
    conceptsByCode: Map<string, ConceptNode>;
    attachments?: Attachment[];
    entities?: Map<string, Entity>;
    specificationsDictionary?: Specification;
    itCodesDictionary?: ITCodes;
    diagnostics: Diagnostic[];
  }) {
    this.metadata = args.metadata;
    this.roots = args.roots;
    this.conceptsByCode = args.conceptsByCode;
    this.attachments = args.attachments ?? [];
    this.entities = args.entities ?? new Map();
    this.specificationsDictionary = args.specificationsDictionary;
    this.itCodesDictionary = args.itCodesDictionary;
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

  /**
   * Walks the tree in depth-first order, calling the visitor for each node.
   * @param visitor Function called for each node with (node, depth, path)
   * @param startFromRoots If true, starts from root nodes; if false, visits all nodes
   */
  walkTree(
    visitor: (node: ConceptNode, depth: number, path: string[]) => void,
    startFromRoots: boolean = true,
  ): void {
    const visited = new Set<ConceptNode>();

    const walk = (node: ConceptNode, depth: number, path: string[]) => {
      if (visited.has(node)) return;
      visited.add(node);

      visitor(node, depth, path);

      const newPath = [...path, node.concept.codeNorm];
      for (const child of node.children) {
        walk(child, depth + 1, newPath);
      }
    };

    if (startFromRoots) {
      for (const root of this.roots) {
        walk(root, 0, []);
      }
    } else {
      for (const node of this.conceptsByCode.values()) {
        if (!visited.has(node)) {
          walk(node, 0, []);
        }
      }
    }
  }

  /**
   * Gets all paths from root to the given concept code.
   * Returns an array of paths, where each path is an array of ConceptNode codes.
   * A concept can appear multiple times in the tree, so there can be multiple paths.
   */
  getAllPathsToConcept(code: string): ConceptNode[][] {
    const targetNode = this.getConcept(code);
    if (!targetNode) return [];

    const paths: ConceptNode[][] = [];

    // Find all occurrences of the target node in the tree
    // We need to allow revisiting nodes since the same node can appear in different branches
    const findPaths = (
      currentNode: ConceptNode,
      currentPath: ConceptNode[],
    ): void => {
      // Avoid infinite loops by checking if current node is already in current path
      if (currentPath.includes(currentNode)) {
        return;
      }

      const newPath = [...currentPath, currentNode];

      // If we found the target, save this path
      if (currentNode === targetNode) {
        paths.push(newPath);
        // Don't continue searching children of the target (they would create longer paths)
        return;
      }

      // Continue searching in children
      for (const child of currentNode.children) {
        findPaths(child, newPath);
      }
    };

    // Start from all root nodes
    for (const root of this.roots) {
      findPaths(root, []);
    }

    return paths;
  }

  /**
   * Gets the first path from root to the given concept code.
   * Returns an array of ConceptNode codes representing the path.
   * For all paths, use getAllPathsToConcept().
   */
  getPathToConcept(code: string): ConceptNode[] | null {
    const paths = this.getAllPathsToConcept(code);
    return paths.length > 0 ? (paths[0] ?? null) : null;
  }

  /**
   * Counts how many times a concept appears in the tree.
   * This includes all occurrences as children of different parents.
   *
   * Since the same ConceptNode instance can appear multiple times in the tree
   * (as a child of different parents), we count each occurrence by traversing
   * the entire tree and counting every time we encounter the target node.
   */
  countConceptOccurrences(code: string): number {
    const targetNode = this.getConcept(code);
    if (!targetNode) return 0;

    let count = 0;

    const countOccurrences = (node: ConceptNode): void => {
      if (node === targetNode) {
        count++;
      }
      for (const child of node.children) {
        countOccurrences(child);
      }
    };

    for (const root of this.roots) {
      countOccurrences(root);
    }

    return count;
  }

  /**
   * Finds all ConceptNode instances of a given code in the tree.
   * Returns an array of all occurrences (they are the same instance, but appear in different places).
   */
  findAllConceptOccurrences(code: string): ConceptNode[] {
    const targetNode = this.getConcept(code);
    if (!targetNode) return [];

    const occurrences: ConceptNode[] = [];

    const findOccurrences = (node: ConceptNode): void => {
      if (node === targetNode) {
        occurrences.push(node);
      }
      for (const child of node.children) {
        findOccurrences(child);
      }
    };

    for (const root of this.roots) {
      findOccurrences(root);
    }

    return occurrences;
  }

  /**
   * Gets the direct parent nodes of a concept.
   * Since a concept can appear multiple times in the tree, it can have multiple parents.
   * This method finds all unique parent nodes by searching the tree.
   */
  getParentNodes(code: string): ConceptNode[] {
    const targetNode = this.getConcept(code);
    if (!targetNode) return [];

    const parents = new Set<ConceptNode>();

    const findParents = (node: ConceptNode): void => {
      for (const child of node.children) {
        if (child === targetNode) {
          parents.add(node);
        }
        findParents(child);
      }
    };

    for (const root of this.roots) {
      findParents(root);
    }

    return Array.from(parents);
  }

  /**
   * Gets all child nodes of a concept (direct children only).
   */
  getChildNodes(code: string): ConceptNode[] {
    const node = this.getConcept(code);
    if (!node) return [];
    return [...node.children];
  }

  /**
   * Gets a summary of the hierarchy structure.
   */
  getHierarchySummary(): {
    totalNodes: number;
    rootNodes: number;
    maxDepth: number;
    nodesByDepth: Map<number, number>;
  } {
    let maxDepth = 0;
    const nodesByDepth = new Map<number, number>();

    this.walkTree((node, depth) => {
      maxDepth = Math.max(maxDepth, depth);
      nodesByDepth.set(depth, (nodesByDepth.get(depth) || 0) + 1);
    });

    return {
      totalNodes: this.conceptsByCode.size,
      rootNodes: this.roots.length,
      maxDepth,
      nodesByDepth,
    };
  }
}
