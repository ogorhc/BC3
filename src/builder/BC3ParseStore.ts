import { ParseNode } from './store/ParseNode';
import { BC3ParseStoreData } from './types/BC3ParseStoreData';

export class BC3ParseStore {
  readonly source: BC3ParseStoreData['source'] | null;
  readonly raw: string | null;
  readonly diagnostics: BC3ParseStoreData['diagnostics'] | null;

  readonly meta?: BC3ParseStoreData['meta'];
  readonly decimals?: BC3ParseStoreData['decimals'];

  readonly concepts: BC3ParseStoreData['concepts'];
  readonly decompositions: BC3ParseStoreData['decompositions'];
  readonly texts: BC3ParseStoreData['texts'];
  readonly measurements: BC3ParseStoreData['measurements'];

  /** Map of normalized codes to ParseNode */
  readonly nodes: Map<string, ParseNode>;
  /** Array of root node codes (concepts without parents) */
  readonly roots: string[];

  constructor(data: BC3ParseStoreData) {
    this.source = data.source;
    this.raw = data.raw;
    this.diagnostics = data.diagnostics;

    this.meta = data.meta;
    this.decimals = data.decimals;

    this.concepts = data.concepts;
    this.decompositions = data.decompositions;
    this.texts = data.texts;
    this.measurements = data.measurements;

    // Initialize nodes and roots from data or empty
    this.nodes = data.nodes ?? new Map();
    this.roots = data.roots ?? [];
  }
}
