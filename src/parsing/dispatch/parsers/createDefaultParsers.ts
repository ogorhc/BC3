import { AParser } from './AParser';
import { BParser } from './BParser';
import { CParser } from './CParser';
import { DParser } from './DParser';
import { EParser } from './EParser';
import { KParser } from './KParser';
import { LParser } from './LParser';
import { MParser } from './MParser';
import { NParser } from './NParser';
import { RecordParser } from './types/RecordParser';
import { TParser } from './TParser';
import { UnknownRecordParser } from './UnknownRecordParser';
import { VParser } from './VParser';
import { XParser } from './XParser';
import { YParser } from './YParser';

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
    new LParser(),
    new XParser(),
    new EParser(),
    new AParser(),
    new UnknownRecordParser(),
  ];
}
