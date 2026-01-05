import { Diagnostic } from '../domain/types';
import { ImporterSource } from '../importers';

import {
  CodeChangeInput,
  ConceptInput,
  DecompositionInput,
  KDecimalsInput,
  MeasurementInput,
  TextInput,
  VersionPropertyInput,
} from '../parsing/dispatch/parsers/types/Parsers';
import { BC3ParseStore } from './BC3ParseStore';
import { ParseNode } from './store/ParseNode';
import { normalizeCode } from './store/normalizeCode';

export class BC3Builder {
  private source: ImporterSource | null = null;
  private raw: string | null = null;
  private diagnostics: Diagnostic[] | null = null;

  private meta: VersionPropertyInput | undefined;
  private decimals: KDecimalsInput | undefined;

  private concepts: Map<string, ConceptInput> = new Map();
  private decompositions: Map<string, DecompositionInput['lines']> = new Map();
  private texts: Map<string, string> = new Map();
  private measurements: MeasurementInput[] = [];

  private codeChanges: Map<string, string> = new Map();

  init(args: {
    source: ImporterSource;
    raw: string;
    diagnostics: Diagnostic[];
  }) {
    this.source = args.source;
    this.raw = args.raw;
    this.diagnostics = args.diagnostics;
  }

  onV(meta: VersionPropertyInput): void {
    this.meta = meta;
  }

  onK(decimals: KDecimalsInput): void {
    this.decimals = decimals;
  }

  onC(concept: ConceptInput): void {
    this.concepts.set(concept.code, concept);
    // opcional: registrar alias -> mismo concept (si quieres bi-mapa luego)
    // for (const alias of concept.codes) this.concepts.set(alias, concept);
  }

  onT(input: TextInput): void {
    this.texts.set(input.code, input.text);
  }

  onD(input: DecompositionInput): void {
    this.decompositions.set(input.parent, input.lines);
  }

  onY(input: DecompositionInput): void {
    const prev = this.decompositions.get(input.parent) ?? [];
    this.decompositions.set(input.parent, [...prev, ...input.lines]);
  }

  onM(input: MeasurementInput): void {
    this.measurements.push(input);
  }

  onN(input: MeasurementInput): void {
    this.measurements.push(input);
  }

  onB(input: CodeChangeInput): void {
    this.codeChanges.set(input.from, input.to ?? '');
  }

  private applyCodeChanges(): void {
    if (this.codeChanges.size === 0) return;

    // Concepts map key migration
    const newConcepts = new Map<string, ConceptInput>();
    for (const [code, concept] of this.concepts.entries()) {
      const mapped = this.codeChanges.get(code) ?? code;
      if (mapped) newConcepts.set(mapped, { ...concept, code: mapped });
    }
    this.concepts = newConcepts;

    // Decompositions map key migration + line.code remap
    const newDecomps = new Map<string, DecompositionInput['lines']>();
    for (const [parent, lines] of this.decompositions.entries()) {
      const newParent = this.codeChanges.get(parent) ?? parent;
      if (!newParent) continue;

      const newLines = lines.map((l) => {
        const newCode = this.codeChanges.get(l.code) ?? l.code;
        return newCode ? { ...l, code: newCode } : l;
      });

      newDecomps.set(newParent, newLines);
    }
    this.decompositions = newDecomps;

    // Text keys
    const newTexts = new Map<string, string>();
    for (const [code, text] of this.texts.entries()) {
      const newCode = this.codeChanges.get(code) ?? code;
      if (newCode) newTexts.set(newCode, text);
    }
    this.texts = newTexts;

    this.measurements = this.measurements.map((m) => ({
      ...m,
      rawCode: this.remapRelation(m.rawCode),
    }));
  }

  private remapCode(code: string): string {
    const mapped = this.codeChanges.get(code);
    return mapped === undefined ? code : mapped;
  }

  private remapRelation(rawCode: string): string {
    const parts = rawCode.split('\\');
    if (parts.length === 1) return this.remapCode(rawCode);

    const parent = this.remapCode(parts[0] ?? '');
    const child = this.remapCode(parts[1] ?? '');

    if (!parent) return child;
    if (!child) return parent;
    return `${parent}\\${child}`;
  }

  /**
   * Assembles the hierarchy from concepts and decompositions.
   * Returns a map of normalized codes to ParseNode and an array of root codes.
   */
  private assembleHierarchy(): {
    nodes: Map<string, ParseNode>;
    roots: string[];
  } {
    const nodes = new Map<string, ParseNode>();
    const childCodes = new Set<string>();

    // First pass: create nodes for all concepts
    for (const [code, concept] of this.concepts.entries()) {
      const normalized = normalizeCode(code);
      const text = this.texts.get(code);

      const node: ParseNode = {
        code: normalized,
        concept,
        parentCode: null,
        childCodes: [],
        text,
      };

      nodes.set(normalized, node);
    }

    // Second pass: establish parent-child relationships from decompositions
    for (const [parentCode, lines] of this.decompositions.entries()) {
      const normalizedParent = normalizeCode(parentCode);
      const parentNode = nodes.get(normalizedParent);

      if (!parentNode) {
        // Parent concept not found - will be reported as diagnostic later
        continue;
      }

      for (const line of lines) {
        const normalizedChild = normalizeCode(line.code);
        const childNode = nodes.get(normalizedChild);

        if (!childNode) {
          // Child concept not found - will be reported as diagnostic later
          continue;
        }

        // Establish relationship
        parentNode.childCodes.push(normalizedChild);
        childNode.parentCode = normalizedParent;
        childCodes.add(normalizedChild);
      }
    }

    // Third pass: identify roots (concepts without parents)
    const roots: string[] = [];
    for (const [code, node] of nodes.entries()) {
      if (node.parentCode === null && !childCodes.has(code)) {
        roots.push(code);
      }
    }

    // If no roots found, create a synthetic root
    if (roots.length === 0 && nodes.size > 0) {
      const syntheticRootCode = '__ROOT__';
      // Add all nodes without parents as children of synthetic root
      for (const [code, node] of nodes.entries()) {
        if (node.parentCode === null) {
          roots.push(code);
        }
      }
      // If still no roots, all nodes are orphans - add them all
      if (roots.length === 0) {
        roots.push(...Array.from(nodes.keys()));
      }
    }

    return { nodes, roots };
  }

  buildStore(): BC3ParseStore {
    this.applyCodeChanges();
    const { nodes, roots } = this.assembleHierarchy();

    return new BC3ParseStore({
      source: this.source,
      raw: this.raw,
      diagnostics: this.diagnostics,
      meta: this.meta,
      decimals: this.decimals,
      concepts: this.concepts,
      decompositions: this.decompositions,
      texts: this.texts,
      measurements: this.measurements,
      nodes,
      roots,
    });
  }
}
