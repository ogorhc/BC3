import { BC3Document } from '../domain/BC3Document';

import { Diagnostic } from '../domain/types';
import { ImporterSource } from '../importers';
import { BC3DocumentData } from '../parsing/dispatch/parsers/types/BC3DocumentData';
import {
  CodeChangeInput,
  ConceptInput,
  DecompositionInput,
  KDecimalsInput,
  MeasurementInput,
  TextInput,
  VersionPropertyInput,
} from '../parsing/dispatch/parsers/types/Parsers';

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

    // Measurements rawCode remap (si rawCode incluye PADRE\HIJO, esto será más avanzado luego)
    this.measurements = this.measurements.map((m) => {
      const mapped = this.codeChanges.get(m.rawCode) ?? m.rawCode;
      return mapped ? { ...m, rawCode: mapped } : m;
    });
  }

  build(): BC3Document {
    if (!this.source || this.raw === null || !this.diagnostics) {
      throw new Error('BC3Builder.build() called before init().');
    }

    const data: BC3DocumentData = {
      source: this.source,
      raw: this.raw,
      diagnostics: this.diagnostics,

      meta: this.meta,
      decimals: this.decimals,

      concepts: this.concepts,
      decompositions: this.decompositions,
      texts: this.texts,
      measurements: this.measurements,
    };
    this.applyCodeChanges();
    return new BC3Document(data);
  }
}
