import { DAY, HOUR, MINUTE, SECOND } from '@/core/__constants__/time'

export const calculateMilliseconds = (params: {
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
}): number => {
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = params

  return days * DAY + hours * HOUR + minutes * MINUTE + seconds * SECOND
}

export const millisecondsToTimeUnits = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / (1 * SECOND))
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalDays = Math.floor(totalHours / 24)

  return {
    days: totalDays,
    hours: totalHours % 24,
    minutes: totalMinutes % 60,
    seconds: totalSeconds % 60,
  }
}
