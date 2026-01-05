import { RawRecord } from './types/RawRecord';
import { Tokenizer, TokenizerOptions } from './types/Tokenizer';

//EOF End-Of-File
const EOF_MARKER = '\x1a';
const START_MARKER = '~';
const FIELD_SEPARATOR = '|';
const SUBFIELD_SEPARATOR = '\\';
const SPACE_CHAR_CODE = 32;
const TAB_CHAR_CODE = 9;
const LF_CHAR_CODE = 10;
const CR_CHAR_CODE = 13;
const WHITESPACE_CHAR_CODES = [
  SPACE_CHAR_CODE,
  TAB_CHAR_CODE,
  LF_CHAR_CODE,
  CR_CHAR_CODE,
];

function stripEofMarker(input: string): string {
  const eof = input.indexOf(EOF_MARKER);
  return eof >= 0 ? input.slice(0, eof) : input;
}

function isWsCharCode(code: number): boolean {
  return WHITESPACE_CHAR_CODES.includes(code);
}

function trimEndWs(s: string): string {
  let i = s.length;
  while (i > 0 && isWsCharCode(s.charCodeAt(i - 1))) i--;
  return s.slice(0, i);
}

function trimStartWs(s: string): string {
  let i = 0;
  while (i < s.length && isWsCharCode(s.charCodeAt(i))) i++;
  return s.slice(i);
}

function splitBySep(text: string, sep: string, trimBoth: boolean): string[] {
  const out: string[] = [];

  let tokenStart = 0;

  const pushToken = (endExclusive: number) => {
    let token = text.slice(tokenStart, endExclusive);

    token = trimEndWs(token);

    if (trimBoth) token = trimStartWs(token);

    out.push(token);
  };

  for (let i = 0; i < text.length; i++) {
    if (text[i] !== sep) continue;

    pushToken(i);
    tokenStart = i + 1;
  }

  pushToken(text.length);
  return out;
}

function parseFields(recordBody: string, trimBoth: boolean): string[][] {
  const fieldStrings = splitBySep(recordBody, FIELD_SEPARATOR, trimBoth);
  return fieldStrings.map((f) => splitBySep(f, SUBFIELD_SEPARATOR, trimBoth));
}

function findRecordStarts(src: string, lenient: boolean): number[] {
  const starts: number[] = [];

  for (let i = 0; i < src.length; i++) {
    if (src[i] !== START_MARKER) continue;

    if (i === 0) {
      starts.push(i);
      continue;
    }

    const prev = src.charCodeAt(i - 1);
    if (isWsCharCode(prev) || lenient) starts.push(i);
  }

  return starts;
}

function buildRawRecord(args: {
  src: string;
  start: number;
  end: number;
  index: number;
  trimBoth: boolean;
  lenient: boolean;
}): RawRecord | null {
  const { src, start, end, index, trimBoth, lenient } = args;

  const raw = src.slice(start, end);

  if (raw.length < 2) {
    return lenient ? { type: '', index, raw, fields: [] } : null;
  }

  const type = raw[1] ?? '';
  if (!type && !lenient) return null;

  const body = raw.slice(3);
  const normalizedBody = trimBoth ? trimStartWs(body) : body;
  const fields = parseFields(normalizedBody, trimBoth);

  return { type, index, raw, fields };
}

export class DefaultTokenizer implements Tokenizer {
  tokenize(input: string, options: TokenizerOptions = {}): RawRecord[] {
    const trimBoth = options.trimAroundSeparators ?? true;
    const lenient = options.lenient ?? true;

    const src = stripEofMarker(input);
    const recordStarts = findRecordStarts(src, lenient);

    const records: RawRecord[] = [];
    for (let r = 0; r <= recordStarts.length; r++) {
      const start = recordStarts[r];
      const end =
        r + 1 < recordStarts.length ? recordStarts[r + 1] : src.length;
      if (start == undefined || end == undefined) continue;
      const rec = buildRawRecord({
        src,
        start,
        end,
        index: records.length,
        trimBoth,
        lenient,
      });

      if (rec) records.push(rec);
    }

    return records;
  }
}
