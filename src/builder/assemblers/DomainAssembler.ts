import { BC3Document } from '../../domain/BC3Document';
import { ConceptNode } from '../../domain/ConceptNode';
import { Concept } from '../../domain/types/Concept';
import { BC3ParseStore } from '../BC3ParseStore';

/**
 * DomainAssembler converts a BC3ParseStore (parsing layer) into a BC3Document (domain layer).
 *
 * This is the boundary between parsing and domain:
 * - Parsing ends with BC3ParseStore (raw data + assembled hierarchy)
 * - Domain starts with BC3Document (semantic model)
 *
 * This assembler should only be called AFTER the hierarchy has been fully assembled.
 */
export class DomainAssembler {
  /**
   * Builds a BC3Document from a fully assembled BC3ParseStore.
   * The store must have its hierarchy already assembled (nodes and roots populated).
   */
  static buildDocument(store: BC3ParseStore): BC3Document {
    // Convert ParseNodes to ConceptNodes (domain objects)
    const conceptNodes = new Map<string, ConceptNode>();
    const rootNodes: ConceptNode[] = [];

    // First pass: create all ConceptNodes from ParseNodes
    for (const [code, parseNode] of store.nodes.entries()) {
      const concept: Concept = {
        code: parseNode.concept.code,
        codeNorm: code,
        unit: parseNode.concept.unit || undefined,
        summary: parseNode.concept.summary || undefined,
        prices: parseNode.concept.prices.map((p) => {
          const num = parseFloat(p);
          return isNaN(num) ? 0 : num;
        }),
        type: parseNode.concept.type
          ? parseInt(parseNode.concept.type, 10)
          : undefined,
      };

      const node = new ConceptNode(concept);
      conceptNodes.set(code, node);
    }

    // Second pass: establish parent-child relationships in domain model
    for (const [code, parseNode] of store.nodes.entries()) {
      const node = conceptNodes.get(code);
      if (!node) continue;

      for (const childCode of parseNode.childCodes) {
        const childNode = conceptNodes.get(childCode);
        if (childNode) {
          node.addChild(childNode);
        }
      }
    }

    // Third pass: identify root nodes in domain model
    for (const rootCode of store.roots) {
      const rootNode = conceptNodes.get(rootCode);
      if (rootNode) {
        rootNodes.push(rootNode);
      }
    }

    // Build metadata from ~V record
    const metadata = store.meta
      ? {
          property: store.meta.property,
          version: store.meta.version,
          versionDate: store.meta.versionDate,
          program: store.meta.program,
          header: store.meta.header,
          labels: store.meta.labels,
          charset: store.meta.charset,
          comment: store.meta.comment,
          infoType: store.meta.infoType,
          certificateNumber: store.meta.certificateNumber,
          certificateDate: store.meta.certificateDate,
          baseUrl: store.meta.baseUrl,
        }
      : undefined;

    return new BC3Document({
      metadata,
      roots: rootNodes,
      conceptsByCode: conceptNodes,
      diagnostics: store.diagnostics ?? [],
    });
  }
}
