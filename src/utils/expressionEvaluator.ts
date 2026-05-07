/**
 * Evaluates the measurement expression a * b * c * d + p for a measurement detail.
 *
 * In BC3:
 *   a = length (L)
 *   b = latitude/width (La)
 *   c = height (A)
 *   d = units (U)
 *   p = constant (default 0)
 *
 * Missing/non-numeric dimensions are treated as 1 (multiplicative identity).
 * The constant p defaults to 0 (additive identity).
 */
export function evaluatePartial(
  dimensions: {
    length?: number;
    latitude?: number;
    height?: number;
    units?: number;
  },
  constantP: number = 0,
): number {
  const a = isNaN(dimensions.length!) ? 1 : dimensions.length!;
  const b = isNaN(dimensions.latitude!) ? 1 : dimensions.latitude!;
  const c = isNaN(dimensions.height!) ? 1 : dimensions.height!;
  const d = isNaN(dimensions.units!) ? 1 : dimensions.units!;
  const p = isNaN(constantP) ? 0 : constantP;

  return a * b * c * d + p;
}

/**
 * Parses a measurement unit string (e.g. "1", "2.5") as a factor.
 * Returns 1 for undefined or unparseable values (acts as multiplicative identity).
 */
export function parseDimensionValue(value: string | undefined): number {
  if (value === undefined || value === '') return 1;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 1 : parsed;
}
