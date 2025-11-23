export enum TimeUnit {
  MILLISECOND = 1,
  SECOND = 1000,
  MINUTE = 60 * 1000,
  HOUR = 60 * 60 * 1000,
  DAY = 24 * 60 * 60 * 1000,
}

export const calculateMilliseconds = (params: {
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
}): number => {
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = params

  return (
    days * TimeUnit.DAY +
    hours * TimeUnit.HOUR +
    minutes * TimeUnit.MINUTE +
    seconds * TimeUnit.SECOND
  )
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
