import { HHmmString } from '@/core/_ports_/date-provider'

export enum StrictBoundDirection {
  Earlier = 'earlier',
  Later = 'later',
}

export type StrictBound = Readonly<{
  direction: StrictBoundDirection
  /** The time limit to validate against (initial time before edit) */
  initialTime: HHmmString
  /** The other time boundary of the session, used to detect midnight spans */
  otherBound?: HHmmString
}>

type ValidationResult = Readonly<
  { isValid: true } | { isValid: false; errorMessage: string }
>

export type StrictModeTimeValidationParams = Readonly<{
  newTime: HHmmString
  isStrictModeActive: boolean
  direction: StrictBoundDirection
  /** The time limit to validate against (initial time before edit) */
  initialTime?: HHmmString | null
  /** The other time boundary of the session, used to detect midnight spans */
  otherBound?: HHmmString | null
}>

/**
 * Checks if a session spans midnight (e.g., 23:00 → 04:00)
 */
function sessionSpansMidnight(
  startTime: HHmmString,
  endTime: HHmmString,
): boolean {
  return startTime > endTime
}

/**
 * Validates a time change in strict mode context.
 *
 * Returns { isValid: true } if:
 * - Strict mode is not active
 * - No initial time to compare against
 * - The new time is valid per strict mode rules
 *
 * During strict mode:
 * - Start times can only be moved earlier (not later)
 * - End times can only be moved later (not earlier)
 *
 * For sessions spanning midnight (e.g., 23:00 → 04:00):
 * - Start times must stay in the "evening zone" (after end time, up to limit)
 * - End times must stay in the "morning zone" (from limit, before start time)
 */
export function validateStrictModeTime(
  params: StrictModeTimeValidationParams,
): ValidationResult {
  const { newTime, isStrictModeActive, initialTime, direction, otherBound } =
    params

  // No validation needed if strict mode is inactive or no initial time
  if (!isStrictModeActive || !initialTime) return { isValid: true }

  const strictBound: StrictBound = {
    direction,
    initialTime,
    otherBound: otherBound ?? undefined,
  }

  return validateStrictBoundTime(newTime, strictBound)
}

/**
 * Core validation logic for strict bound time constraints.
 * Prefer using validateStrictModeTime for a simpler API.
 */
export function validateStrictBoundTime(
  newTime: HHmmString,
  strictBound: StrictBound,
): ValidationResult {
  const { direction, initialTime, otherBound } = strictBound

  const isInvalid = (() => {
    if (direction === StrictBoundDirection.Earlier) {
      // Start time validation: can only move earlier
      if (newTime > initialTime) return true

      // If session spans midnight, reject times in the "morning zone"
      // Session like 23:00 → 04:00: reject times between 00:00 and otherBound (04:00)
      if (
        otherBound &&
        sessionSpansMidnight(initialTime, otherBound) &&
        newTime <= otherBound
      )
        return true

      return false
    }
    // End time validation: can only move later
    if (newTime < initialTime) return true

    // If session spans midnight, reject times in the "evening zone"
    // Session like 23:00 → 04:00: reject times between otherBound (23:00) and 23:59
    if (
      otherBound &&
      sessionSpansMidnight(otherBound, initialTime) &&
      newTime >= otherBound
    )
      return true

    return false
  })()

  if (!isInvalid) return { isValid: true }

  const errorMessage =
    direction === StrictBoundDirection.Earlier
      ? 'Cannot set a later start time during strict mode'
      : 'Cannot set an earlier end time during strict mode'

  return { isValid: false, errorMessage }
}
