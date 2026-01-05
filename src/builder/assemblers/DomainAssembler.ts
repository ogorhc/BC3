import { Attachment } from '../../domain/Attachment';
import { BC3Document } from '../../domain/BC3Document';
import { ConceptNode } from '../../domain/ConceptNode';
import { Decomposition } from '../../domain/Decomposition';
import { Entity, EntityContact } from '../../domain/Entity';
import { ITCode, ITCodes } from '../../domain/ITCode';
import { Measurement, MeasurementDetail } from '../../domain/Measurement';
import {
  Specification,
  SpecificationSection,
} from '../../domain/Specification';
import { Thesaurus } from '../../domain/Thesaurus';
import { Concept } from '../../domain/types/Concept';
import { BC3ParseStore } from '../BC3ParseStore';
import { normalizeCode } from '../store/normalizeCode';

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
      // Get text from store if available
      const text = parseNode.text || store.texts.get(parseNode.concept.code);

      const concept: Concept = {
        code: parseNode.concept.code,
        codeNorm: code,
        unit: parseNode.concept.unit || undefined,
        summary: parseNode.concept.summary || undefined,
        prices: parseNode.concept.prices.map((p) => {
          const num = parseFloat(p);
          return isNaN(num) ? 0 : num;
        }),
        dates: parseNode.concept.dates || [],
        type: parseNode.concept.type
          ? parseInt(parseNode.concept.type, 10)
          : undefined,
        text,
      };

      const node = new ConceptNode(concept);
      conceptNodes.set(code, node);
    }

    // Second pass: establish parent-child relationships in domain model
    // IMPORTANT: In BC3, the same concept can appear multiple times in the tree
    // (as a child of different parents). We reuse the same ConceptNode instance,
    // but it will appear in multiple places in the tree structure.
    for (const [code, parseNode] of store.nodes.entries()) {
      const node = conceptNodes.get(code);
      if (!node) continue;

      for (const childCode of parseNode.childCodes) {
        const childNode = conceptNodes.get(childCode);
        if (childNode) {
          // Add the same child node instance - it can appear multiple times
          node.addChild(childNode);
        }
      }
    }

    // Third pass: build and associate Decompositions
    for (const [parentCode, lines] of store.decompositions.entries()) {
      const normalizedParent = normalizeCode(parentCode);
      const parentNode = conceptNodes.get(normalizedParent);

      if (!parentNode) continue;

      for (const line of lines) {
        const normalizedChild = normalizeCode(line.code);
        const childNode = conceptNodes.get(normalizedChild);

        if (!childNode) continue;

        const decomposition = new Decomposition({
          parentCode: normalizedParent,
          childCode: normalizedChild,
          factor: line.factor ? parseFloat(line.factor) : undefined,
          performance: line.performance
            ? parseFloat(line.performance)
            : undefined,
          percentageCodes: line.percentagesCodes,
          percentageRaw: line.percentagesRaw,
        });

        parentNode.addDecomposition(decomposition);
      }
    }

    // Fourth pass: build and associate Measurements
    for (const measurementInput of store.measurements) {
      // Parse rawCode: can be "PADRE\HIJO" or "HIJO"
      const parts = measurementInput.rawCode.split('\\');
      let conceptCode: string;
      let parentCode: string | undefined;

      if (parts.length === 2) {
        // Format: PADRE\HIJO
        parentCode = normalizeCode(parts[0] ?? '');
        conceptCode = normalizeCode(parts[1] ?? '');
      } else {
        // Format: HIJO (standalone)
        conceptCode = normalizeCode(measurementInput.rawCode);
      }

      const node = conceptNodes.get(conceptCode);
      if (!node) continue;

      // Convert MeasurementDetailInput to MeasurementDetail
      const details: MeasurementDetail[] = measurementInput.details.map(
        (detail) => ({
          type: detail.type,
          comment: detail.comment,
          bimIds: detail.bimIds,
          units: detail.units,
          length: detail.length ? parseFloat(detail.length) : undefined,
          latitude: detail.latitude ? parseFloat(detail.latitude) : undefined,
          height: detail.height ? parseFloat(detail.height) : undefined,
        }),
      );

      const measurement = new Measurement({
        conceptCode,
        parentCode,
        positions: measurementInput.positions,
        total: measurementInput.total
          ? parseFloat(measurementInput.total)
          : undefined,
        details,
        label: measurementInput.label,
      });

      node.addMeasurement(measurement);
    }

    // Fifth pass: identify root nodes in domain model
    for (const rootCode of store.roots) {
      const rootNode = conceptNodes.get(rootCode);
      if (rootNode) {
        rootNodes.push(rootNode);
      }
    }

    // Sixth pass: build and associate Specifications
    for (const [conceptCode, lInput] of store.pliegos.entries()) {
      const normalizedCode = normalizeCode(conceptCode);
      const node = conceptNodes.get(normalizedCode);
      if (!node) continue;

      const sections = lInput.sections.map(
        (s) =>
          new SpecificationSection({
            sectionCode: s.sectionCode,
            sectionLabel: s.sectionLabel,
            text: s.text,
            rtfFile: s.rtfFile,
            htmFile: s.htmFile,
          }),
      );

      const specification = new Specification({
        conceptCode: normalizedCode,
        sections,
      });

      node.setSpecification(specification);
    }

    // Seventh pass: build and associate IT Codes
    for (const [conceptCode, xInput] of store.itCodes.entries()) {
      const normalizedCode = normalizeCode(conceptCode);
      const node = conceptNodes.get(normalizedCode);
      if (!node) continue;

      const items = xInput.items.map(
        (item) =>
          new ITCode({
            itCode: item.itCode,
            description: item.description,
            unit: item.unit,
            value: item.value,
          }),
      );

      const itCodes = new ITCodes({
        conceptCode: normalizedCode,
        items,
      });

      node.setITCodes(itCodes);
    }

    // Eighth pass: build and associate Thesaurus
    for (const [conceptCode, aInput] of store.thesaurus.entries()) {
      const normalizedCode = normalizeCode(conceptCode);
      const node = conceptNodes.get(normalizedCode);
      if (!node) continue;

      const thesaurus = new Thesaurus({
        conceptCode: normalizedCode,
        keys: aInput.thesaurusKeys,
      });

      node.setThesaurus(thesaurus);
    }

    // Build entities
    const entities = new Map<string, Entity>();
    for (const [entityCode, eInput] of store.entities.entries()) {
      const entity = new Entity({
        entityCode,
        summary: eInput.summary,
        name: eInput.name,
        contact: eInput.contact
          ? new EntityContact({
              type: eInput.contact.type,
              subname: eInput.contact.subname,
              address: eInput.contact.address,
              postalCode: eInput.contact.postalCode,
              city: eInput.contact.city,
              province: eInput.contact.province,
              country: eInput.contact.country,
              phones: eInput.contact.phones,
              faxes: eInput.contact.faxes,
              contacts: eInput.contact.contacts,
            })
          : undefined,
        cif: eInput.cif,
        web: eInput.web,
        email: eInput.email,
      });

      entities.set(entityCode, entity);
    }

    // Build specifications dictionary
    const specificationsDictionary = store.pliegosDictionary
      ? new Specification({
          sections: store.pliegosDictionary.sections.map(
            (s) =>
              new SpecificationSection({
                sectionCode: s.sectionCode,
                sectionLabel: s.sectionLabel,
                text: s.text,
                rtfFile: s.rtfFile,
                htmFile: s.htmFile,
              }),
          ),
        })
      : undefined;

    // Build IT codes dictionary
    const itCodesDictionary = store.itCodesDictionary
      ? new ITCodes({
          items: store.itCodesDictionary.items.map(
            (item) =>
              new ITCode({
                itCode: item.itCode,
                description: item.description,
                unit: item.unit,
                value: item.value,
              }),
          ),
        })
      : undefined;

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
      entities,
      specificationsDictionary,
      itCodesDictionary,
      diagnostics: store.diagnostics ?? [],
    });
  }
}
