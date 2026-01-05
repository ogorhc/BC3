/**
 * Normalizes a BC3 concept code by removing #/## prefixes.
 *
 * Examples:
 * - "##01" -> "01"
 * - "#01" -> "01"
 * - "01" -> "01"
 * - "##01#02" -> "01#02" (only removes leading ##)
 */
export function normalizeCode(code: string): string {
  if (code.startsWith('##')) {
    return code.slice(2);
  }
  if (code.startsWith('#')) {
    return code.slice(1);
  }
  return code;
}
