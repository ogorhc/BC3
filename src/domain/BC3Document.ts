import { BC3DocumentData } from '../parsing/dispatch/parsers/types/BC3DocumentData';

export class BC3Document {
  readonly source: BC3DocumentData['source'];
  readonly raw: string;
  readonly diagnostics: BC3DocumentData['diagnostics'];

  readonly meta?: BC3DocumentData['meta'];
  readonly decimals?: BC3DocumentData['decimals'];

  readonly concepts: BC3DocumentData['concepts'];
  readonly decompositions: BC3DocumentData['decompositions'];
  readonly texts: BC3DocumentData['texts'];
  readonly measurements: BC3DocumentData['measurements'];

  constructor(data: BC3DocumentData) {
    this.source = data.source;
    this.raw = data.raw;
    this.diagnostics = data.diagnostics;

    this.meta = data.meta;
    this.decimals = data.decimals;

    this.concepts = data.concepts;
    this.decompositions = data.decompositions;
    this.texts = data.texts;
    this.measurements = data.measurements;
  }
}
