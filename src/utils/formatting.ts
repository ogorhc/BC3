/**
 * Formatting utilities for BC3 data display.
 */

/**
 * Formats a price value as currency (EUR).
 * @param price - Price value to format
 * @param locale - Locale for formatting (default: 'es-ES')
 * @returns Formatted price string or 'N/A' if invalid
 */
export function formatPrice(
  price: number | undefined | null,
  locale: string = 'es-ES',
): string {
  if (price === undefined || price === null || isNaN(price)) return 'N/A';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Formats a number with default decimal places.
 * @param num - Number to format
 * @param locale - Locale for formatting (default: 'es-ES')
 * @param minDecimals - Minimum decimal places (default: 2)
 * @param maxDecimals - Maximum decimal places (default: 2)
 * @returns Formatted number string or 'N/A' if invalid
 */
export function formatNumber(
  num: number | undefined | null,
  locale: string = 'es-ES',
  minDecimals: number = 2,
  maxDecimals: number = 2,
): string {
  if (num === undefined || num === null || isNaN(num)) return 'N/A';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(num);
}
