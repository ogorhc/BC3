export function isNonEmpty(s: string | undefined): s is string {
  return typeof s === 'string' && s.trim().length > 0;
}
