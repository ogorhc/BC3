import { Attachment } from './Attachment';
import { Coefficients } from './Coefficients';
import { ConceptNode } from './ConceptNode';
import { CostOverride } from './CostOverride';
import { Entity } from './Entity';
import { ITCodes } from './ITCode';
import { Specification } from './Specification';
import { Diagnostic } from './types';
import { DocumentSummary, RecordCounts } from './types/RecordCounts';
import {
  ResourceHierarchy,
  ResourceType,
  ResourceTypeGroup,
  ResourceConcept,
  ResourceOccurrence,
  RESOURCE_TYPE_LABELS,
} from './types/ResourceHierarchy';

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

  /** Cost coefficients from ~K record */
  readonly coefficients?: Coefficients;

  /** Geographic cost overrides from ~O records */
  readonly costOverrides: Map<string, CostOverride>;

  /** Diagnostics collected during parsing */
  readonly diagnostics: Diagnostic[];

  /** Raw record counts from parsing */
  readonly recordCounts: RecordCounts;

  constructor(args: {
    metadata?: DocumentMetadata;
    roots: ConceptNode[];
    conceptsByCode: Map<string, ConceptNode>;
    attachments?: Attachment[];
    entities?: Map<string, Entity>;
    specificationsDictionary?: Specification;
    itCodesDictionary?: ITCodes;
    coefficients?: Coefficients;
    costOverrides?: Map<string, CostOverride>;
    diagnostics: Diagnostic[];
    recordCounts?: RecordCounts;
  }) {
    this.metadata = args.metadata;
    this.roots = args.roots;
    this.conceptsByCode = args.conceptsByCode;
    this.attachments = args.attachments ?? [];
    this.entities = args.entities ?? new Map();
    this.specificationsDictionary = args.specificationsDictionary;
    this.itCodesDictionary = args.itCodesDictionary;
    this.coefficients = args.coefficients;
    this.costOverrides = args.costOverrides ?? new Map();
    this.diagnostics = args.diagnostics;
    this.recordCounts = args.recordCounts ?? ({} as RecordCounts);
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
   * Gets decomposition information (performance, factor) for a child concept from a parent.
   * Returns undefined if the relationship doesn't exist.
   */
  getDecompositionInfo(
    parentCode: string,
    childCode: string,
  ): { performance?: number; factor?: number } | undefined {
    const parentNode = this.getConcept(parentCode);
    if (!parentNode) return undefined;

    for (const decomp of parentNode.decompositions) {
      if (decomp.childCode === childCode) {
        return {
          performance: decomp.performance,
          factor: decomp.factor,
        };
      }
    }

    return undefined;
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

  /**
   * Gets the resource hierarchy grouped by resource type (0-5).
   *
   * Structure:
   * - Level 1: Resource type (Labor, Machinery, Materials, etc.)
   * - Level 2: Decomposed concept codes (concepts that appear as children)
   * - Level 3: Units of work where each decomposed concept appears (parent concepts)
   *
   * For each occurrence, calculates: parentQuantity × childPerformance = calculatedTotal
   *
   * @returns ResourceHierarchy with concepts grouped by type
   */
  getResourceHierarchy(): ResourceHierarchy {
    // Cache to avoid recalculating
    if (this._resourceHierarchyCache) {
      return this._resourceHierarchyCache;
    }

    // Step 1: Identify all concepts that are "children" (appear in decompositions)
    const childConcepts = new Set<ConceptNode>();

    for (const node of this.conceptsByCode.values()) {
      for (const decomp of node.decompositions) {
        const childNode = this.getConcept(decomp.childCode);
        if (childNode) {
          childConcepts.add(childNode);
        }
      }
    }

    // Step 2: Group child concepts by type
    const conceptsByType = new Map<ResourceType, ConceptNode[]>();

    for (const childNode of childConcepts) {
      const type = (childNode.concept.type ?? 0) as ResourceType;
      if (!conceptsByType.has(type)) {
        conceptsByType.set(type, []);
      }
      conceptsByType.get(type)!.push(childNode);
    }

    // Step 3: Build ResourceTypeGroup for each type
    const groups = new Map<ResourceType, ResourceTypeGroup>();
    let totalConcepts = 0;

    for (const [type, childNodes] of conceptsByType.entries()) {
      const resourceConcepts: ResourceConcept[] = [];

      for (const childNode of childNodes) {
        // Find all paths to this child concept to get all occurrences
        // Each path represents one occurrence in the tree
        const allPaths = this.getAllPathsToConcept(childNode.concept.codeNorm);
        const occurrences: ResourceOccurrence[] = [];

        // Extract parent from each path (parent is the second-to-last node in each path)
        for (const path of allPaths) {
          if (path.length < 2) continue; // Skip if no parent

          const parentNode = path[path.length - 2]; // Parent is the node before the child
          if (!parentNode) continue; // Skip if parent is undefined

          // Get decomposition info (performance) directly from parent's decompositions
          // Try both normalized code and original code to find the decomposition
          const childCodeNorm = childNode.concept.codeNorm;
          const childCode = childNode.concept.code;

          let childPerformance: number | undefined;
          let childFactor: number | undefined;

          const decomposition = parentNode.decompositions.find(
            (d) =>
              d.childCode === childCodeNorm ||
              d.childCode === childCode ||
              d.childCode === childCode.replace(/^#+/, ''),
          );

          if (decomposition) {
            childPerformance = decomposition.performance;
            childFactor = decomposition.factor;
          }

          // Get parent performance from its own decomposition (where parent is a child)
          // Look for the grandparent (parent of parent) in the path
          let parentPerformance: number | undefined;
          if (path.length >= 3) {
            const grandParentNode = path[path.length - 3]; // Grandparent is two nodes before the child
            if (grandParentNode) {
              const parentCodeNorm = parentNode.concept.codeNorm;
              const parentCode = parentNode.concept.code;

              const parentDecomposition = grandParentNode.decompositions.find(
                (d) =>
                  d.childCode === parentCodeNorm ||
                  d.childCode === parentCode ||
                  d.childCode === parentCode.replace(/^#+/, ''),
              );

              if (parentDecomposition) {
                parentPerformance = parentDecomposition.performance;
              }
            }
          }

          // Calculate: parentPerformance × childPerformance
          const calculatedTotal =
            parentPerformance !== undefined && childPerformance !== undefined
              ? parentPerformance * childPerformance
              : undefined;

          occurrences.push({
            parent: parentNode,
            parentQuantity: parentPerformance, // Store parent performance instead of quantity
            childPerformance,
            calculatedTotal,
          });
        }

        if (occurrences.length > 0) {
          resourceConcepts.push({
            concept: childNode,
            occurrences,
          });
          totalConcepts++;
        }
      }

      // Sort concepts by code for consistent ordering
      resourceConcepts.sort((a, b) => {
        const codeA = a.concept.concept.codeNorm;
        const codeB = b.concept.concept.codeNorm;
        return codeA.localeCompare(codeB);
      });

      groups.set(type, {
        type,
        typeLabel: RESOURCE_TYPE_LABELS[type],
        concepts: resourceConcepts,
      });
    }

    // Ensure all types 0-5 are present (even if empty)
    for (let i = 0; i <= 5; i++) {
      const type = i as ResourceType;
      if (!groups.has(type)) {
        groups.set(type, {
          type,
          typeLabel: RESOURCE_TYPE_LABELS[type],
          concepts: [],
        });
      }
    }

    const hierarchy: ResourceHierarchy = {
      groups,
      totalConcepts,
    };

    // Cache the result
    this._resourceHierarchyCache = hierarchy;
    return hierarchy;
  }

  /** Internal cache for resource hierarchy */
  private _resourceHierarchyCache?: ResourceHierarchy;

  /** Internal cache for document summary */
  private _summaryCache?: DocumentSummary;

  /**
   * Returns a high-level summary of the parsed document.
   *
   * Includes file metadata, raw record counts, concept/measurement/
   * decomposition statistics, auxiliary data counts, and a diagnostic
   * severity breakdown.  Computed once and cached on the document.
   */
  getSummary(): DocumentSummary {
    if (this._summaryCache) return this._summaryCache;

    const hierarchy = this.getHierarchySummary();

    let leafCount = 0;
    const typeDist = new Map<number, number>();
    let totalMeasurementLines = 0;
    let conceptsWithD = 0;
    let conceptsWithSpec = 0;
    let conceptsWithIT = 0;
    let conceptsWithThes = 0;
    let totalDecomps = 0;

    for (const node of this.conceptsByCode.values()) {
      if (node.children.length === 0) leafCount++;

      const t = node.concept.type;
      if (t !== undefined && t !== null) {
        typeDist.set(t, (typeDist.get(t) ?? 0) + 1);
      }

      totalMeasurementLines += node.measurements.reduce(
        (sum, m) => sum + m.details.length,
        0,
      );
      if (node.specification) conceptsWithSpec++;
      if (node.itCodes) conceptsWithIT++;
      if (node.thesaurus) conceptsWithThes++;

      for (const d of node.decompositions) {
        totalDecomps++;
      }
      if (node.decompositions.length > 0) conceptsWithD++;
    }

    const diag = this.diagnostics.reduce(
      (acc, d) => {
        if (d.level === 'info') acc.info++;
        else if (d.level === 'warn') acc.warn++;
        else if (d.level === 'error') acc.error++;
        return acc;
      },
      { info: 0, warn: 0, error: 0 },
    );

    this._summaryCache = {
      metadata: this.metadata
        ? {
            property: this.metadata.property,
            version: this.metadata.version,
            versionDate: this.metadata.versionDate,
            program: this.metadata.program,
            header: this.metadata.header,
            charset: this.metadata.charset,
          }
        : undefined,
      recordCounts: this.recordCounts,
      totalConcepts: hierarchy.totalNodes,
      rootConcepts: hierarchy.rootNodes,
      leafConcepts: leafCount,
      maxDepth: hierarchy.maxDepth,
      conceptTypeDistribution: typeDist,
      conceptsWithMeasurements: this.conceptsByCode.size
        ? Array.from(this.conceptsByCode.values()).filter(
            (n) => n.measurements.length > 0,
          ).length
        : 0,
      totalMeasurementLines,
      totalDecompositions: totalDecomps,
      conceptsWithDecompositions: conceptsWithD,
      specifications: conceptsWithSpec,
      hasSpecificationsDictionary: !!this.specificationsDictionary,
      itCodes: conceptsWithIT,
      hasItCodesDictionary: !!this.itCodesDictionary,
      thesaurusEntries: conceptsWithThes,
      entities: this.entities.size,
      costOverrides: this.costOverrides.size,
      attachments: this.attachments.length,
      diagnostics: diag,
    };

    return this._summaryCache;
  }
}
