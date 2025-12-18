import { CParser } from './CParser';
import { DParser } from './DParser';
import { KParser } from './KParser';
import { MParser } from './MParser';
import { TParser } from './TParser';
import { RecordParser } from './types/RecordParser';
import { UnknownRecordParser } from './UnknownRecordParser';
import { VParser } from './VParser';
import { BParser } from './BParser';
import { YParser } from './YParser';
import { NParser } from './NParser';

export function createDefaultParsers(): RecordParser[] {
  return [
    new VParser(),
    new KParser(),
    new CParser(),
    new DParser(),
    new TParser(),
    new MParser(),
    new NParser(),
    new BParser(),
    new YParser(),
    new UnknownRecordParser(),
  ];
}
