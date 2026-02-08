import { HHmmString } from '@/core/_ports_/date-provider'

export enum StrictBoundDirection {
  Earlier = 'earlier',
  Later = 'later',
}

export type StrictBound = Readonly<{
  direction: StrictBoundDirection
  initialTime: HHmmString
  otherBound?: HHmmString
}>

export type ValidationResult = Readonly<
  { isValid: true } | { isValid: false; errorMessage: string }
>

export type StrictModeTimeValidationParams = Readonly<{
  newTime: HHmmString
  isStrictModeActive: boolean
  direction: StrictBoundDirection
  initialTime?: HHmmString | null
  otherBound?: HHmmString | null
}>

function spansMidnight(start: HHmmString, end: HHmmString) {
  return start > end
}

function isInMorningZone(time: HHmmString, endTime: HHmmString) {
  return time <= endTime
}

function isInEveningZone(time: HHmmString, startTime: HHmmString) {
  return time >= startTime
}

export function validateStrictModeTime(
  params: StrictModeTimeValidationParams,
): ValidationResult {
  const { newTime, isStrictModeActive, initialTime, direction, otherBound } =
    params

  if (!isStrictModeActive || !initialTime) return { isValid: true }

  return validateStrictBoundTime(newTime, {
    direction,
    initialTime,
    otherBound: otherBound ?? undefined,
  })
}

export function validateStrictBoundTime(
  newTime: HHmmString,
  strictBound: StrictBound,
): ValidationResult {
  const { direction, initialTime, otherBound } = strictBound

  const isValidEarlierBound =
    newTime <= initialTime &&
    !(
      otherBound &&
      spansMidnight(initialTime, otherBound) &&
      isInMorningZone(newTime, otherBound)
    )

  const isValidLaterBound =
    newTime >= initialTime &&
    !(
      otherBound &&
      spansMidnight(otherBound, initialTime) &&
      isInEveningZone(newTime, otherBound)
    )

  const isValid =
    direction === StrictBoundDirection.Earlier
      ? isValidEarlierBound
      : isValidLaterBound

  if (isValid) return { isValid: true }

  const errorMessage =
    direction === StrictBoundDirection.Earlier
      ? 'Cannot set a later start time during strict mode'
      : 'Cannot set an earlier end time during strict mode'

  return { isValid: false, errorMessage }
}
