export enum StrictBoundDirection {
  Earlier = 'earlier',
  Later = 'later',
}

export type StrictBound = Readonly<{
  direction: StrictBoundDirection
  limit: string
}>

type ValidationResult = Readonly<
  { isValid: true } | { isValid: false; errorMessage: string }
>

/**
 * Validates a time change against a strict bound constraint.
 *
 * During strict mode:
 * - Start times can only be moved earlier (not later)
 * - End times can only be moved later (not earlier)
 *
 * @param newTime - The new time in HH:mm format
 * @param strictBound - The bound constraint with direction and limit
 * @returns Discriminated union: { isValid: true } or { isValid: false, errorMessage: string }
 *
 * @note This uses lexicographic string comparison which works correctly for
 * HH:mm format within a single day. Sessions spanning midnight are not
 * currently supported and may produce unexpected results.
 */
export function validateStrictBoundTime(
  newTime: string,
  strictBound: StrictBound,
): ValidationResult {
  const isInvalid =
    strictBound.direction === StrictBoundDirection.Earlier
      ? newTime > strictBound.limit
      : newTime < strictBound.limit

  if (!isInvalid) return { isValid: true }

  const errorMessage =
    strictBound.direction === StrictBoundDirection.Earlier
      ? 'Cannot set a later start time during strict mode'
      : 'Cannot set an earlier end time during strict mode'

  return { isValid: false, errorMessage }
}
