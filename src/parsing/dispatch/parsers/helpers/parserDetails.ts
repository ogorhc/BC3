import { isNonEmpty } from '../../../../utils/strings';
import { MeasurementDetailInput } from '../types/Parsers';

function extractBimIdsFromComment(comment?: string): string[] | undefined {
  if (!comment) return undefined;

  const matches = comment.match(/#[^\s#|\\]+/g);
  if (!matches) return undefined;

  const ids = matches.map((m) => m.slice(1)).filter(Boolean);
  return ids.length ? ids : undefined;
}

export function parseDetails(detailField: string[]): MeasurementDetailInput[] {
  const out: MeasurementDetailInput[] = [];
  const CHUNK = 6;

  if (detailField.length === 0) return out;

  for (let i = 0; i < detailField.length; i += CHUNK) {
    const raw = detailField.slice(i, i + CHUNK);

    const comment = raw[1];
    const bimIds = extractBimIdsFromComment(comment);

    out.push({
      type: isNonEmpty(raw[0]) ? raw[0] : undefined,
      comment: isNonEmpty(comment) ? comment : undefined,
      bimIds,
      units: isNonEmpty(raw[2]) ? raw[2] : undefined,
      length: isNonEmpty(raw[3]) ? raw[3] : undefined,
      latitude: isNonEmpty(raw[4]) ? raw[4] : undefined,
      height: isNonEmpty(raw[5]) ? raw[5] : undefined,
      raw,
    });
  }

  return out;
}
