/**
 * Type guard filter that removes null and undefined values from an array.
 * Usage: array.filter(isDefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}
