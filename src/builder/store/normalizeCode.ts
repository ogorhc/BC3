/**
 * Normalizes a BC3 concept code by removing #/## prefixes and trailing #.
 *
 * Examples:
 * - "##01" -> "01"
 * - "#01" -> "01"
 * - "01" -> "01"
 * - "##01#02" -> "01#02" (only removes leading ##)
 * - "I.LT04.01#" -> "I.LT04.01" (removes trailing #)
 * - "#I.LT04.01#" -> "I.LT04.01" (removes both leading and trailing #)
 */
export function normalizeCode(code: string): string {
  let normalized = code;

  // Remove leading # or ##
  if (normalized.startsWith('##')) {
    normalized = normalized.slice(2);
  } else if (normalized.startsWith('#')) {
    normalized = normalized.slice(1);
  }

  // Remove trailing #
  if (normalized.endsWith('#')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}
