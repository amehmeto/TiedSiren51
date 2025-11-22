export enum TimeUnit {
  MILLISECOND = 1,
  SECOND = 1000, // 1 second = 1000 milliseconds
  MINUTE = 60 * 1000, // 1 minute = 60 seconds
  HOUR = 60 * 60 * 1000, // 1 hour = 60 minutes
  DAY = 24 * 60 * 60 * 1000, // 1 day = 24 hours
}

export const TIME_UNIT_NAMES = {
  day: 'day',
  days: 'days',
  hour: 'hour',
  hours: 'hours',
  minute: 'min',
  minutes: 'min',
  second: 's',
  seconds: 's',
} as const

export const calculateMilliseconds = (params: {
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
}): number => {
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = params

  const daysInMs = days * TimeUnit.DAY
  const hoursInMs = hours * TimeUnit.HOUR
  const minutesInMs = minutes * TimeUnit.MINUTE
  const secondsInMs = seconds * TimeUnit.SECOND

  return daysInMs + hoursInMs + minutesInMs + secondsInMs
}

export const millisecondsToTimeUnits = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / TimeUnit.SECOND)
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
