import { DocumentSummary } from '../domain/types/RecordCounts';

function fmt(n: number | undefined | null, fallback: string = '0'): string {
  if (n === undefined || n === null) return fallback;
  return n.toString();
}

function formatHeader(summary: DocumentSummary): string {
  const meta = summary.metadata;
  const parts: string[] = [];

  if (meta?.version) parts.push(`Version: ${meta.version}`);
  if (meta?.program) parts.push(`Program: ${meta.program}`);
  if (meta?.charset) parts.push(`Charset: ${meta.charset}`);
  if (meta?.header) parts.push(`Header: ${meta.header}`);

  return parts.join('  ');
}

function formatRecordCounts(summary: DocumentSummary): string {
  const rc = summary.recordCounts;
  return [
    `V:${fmt(rc.V)}`,
    `C:${fmt(rc.C)}`,
    `D:${fmt(rc.D)}`,
    `T:${fmt(rc.T)}`,
    `M:${fmt(rc.M)}`,
    `N:${fmt(rc.N)}`,
    `L:${fmt(rc.L)}`,
    `X:${fmt(rc.X)}`,
    `E:${fmt(rc.E)}`,
    `A:${fmt(rc.A)}`,
    `O:${fmt(rc.O)}`,
    `K:${fmt(rc.K)}`,
    `Y:${fmt(rc.Y)}`,
    `G:${fmt(rc.G)}`,
    `unknown:${fmt(rc.unknown)}`,
  ].join('  ');
}

function formatTypeDistribution(dist: Map<number, number>): string {
  const parts: string[] = [];
  const sorted = Array.from(dist.entries()).sort((a, b) => a[0] - b[0]);
  for (const [type, count] of sorted) {
    parts.push(`Type ${type}: ${count}`);
  }
  return parts.length ? parts.join('  ') : '(none)';
}

/**
 * Formats a {@link DocumentSummary} into a compact, human-readable text block.
 *
 * Suitable for console output, diagnostic logs, or debug displays.
 */
export function summaryToString(summary: DocumentSummary): string {
  const header = formatHeader(summary);

  const lines: string[] = [];

  if (header) {
    lines.push(header);
    lines.push('');
  }

  lines.push(`Records:  ${formatRecordCounts(summary)}`);
  lines.push('');

  lines.push(
    `Concepts:  ${summary.totalConcepts} total  ` +
      `${summary.rootConcepts} root  ` +
      `${summary.leafConcepts} leaves  ` +
      `max depth: ${summary.maxDepth}`,
  );
  lines.push(`  ${formatTypeDistribution(summary.conceptTypeDistribution)}`);
  lines.push('');

  lines.push(
    `Measurements:  ${summary.conceptsWithMeasurements} concepts  ` +
      `${summary.totalMeasurementLines} detail lines`,
  );
  lines.push(
    `Decompositions:  ${summary.totalDecompositions} links  ` +
      `${summary.conceptsWithDecompositions} concepts with decompositions`,
  );
  lines.push('');

  lines.push(
    `Specifications:  ${summary.specifications}  ` +
      `(dictionary: ${summary.hasSpecificationsDictionary ? 'yes' : 'no'})`,
  );
  lines.push(
    `IT Codes:  ${summary.itCodes}  ` +
      `(dictionary: ${summary.hasItCodesDictionary ? 'yes' : 'no'})`,
  );
  lines.push(`Thesaurus:  ${summary.thesaurusEntries}`);
  lines.push(`Entities:  ${summary.entities}`);
  lines.push(`Cost Overrides:  ${summary.costOverrides}`);
  lines.push(`Attachments:  ${summary.attachments}`);
  lines.push('');

  const diag = summary.diagnostics;
  lines.push(
    `Diagnostics:  ${diag.info} info  ${diag.warn} warn  ${diag.error} error`,
  );

  return lines.join('\n');
}
