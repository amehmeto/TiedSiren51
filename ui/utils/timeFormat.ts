import { TimeRemaining } from '@/core/timer/timer'
import { calculateMilliseconds } from '@/core/timer/timer.utils'

export const formatCountdown = (timeLeft: TimeRemaining): string => {
  const parts: string[] = []

  const hasDays = timeLeft.days > 0
  const hasHours = timeLeft.hours > 0
  const hasMinutes = timeLeft.minutes > 0

  if (hasDays) parts.push(`${timeLeft.days}d`)

  if (hasHours || hasDays) parts.push(`${timeLeft.hours}h`)

  if (hasMinutes || hasHours || hasDays) parts.push(`${timeLeft.minutes}m`)

  parts.push(`${timeLeft.seconds}s`)

  return parts.join(' ')
}

export const formatInlineRemaining = (timeLeft: TimeRemaining): string => {
  const parts: string[] = []

  const hasDays = timeLeft.days > 0
  const hasHours = timeLeft.hours > 0
  const hasMinutes = timeLeft.minutes > 0
  const hasSeconds = timeLeft.seconds > 0

  if (hasDays) parts.push(`${timeLeft.days}d`)

  if (hasHours || hasDays) parts.push(`${timeLeft.hours}h`)

  if (hasMinutes || hasHours || hasDays) parts.push(`${timeLeft.minutes}m`)

  if (hasSeconds) parts.push(`${timeLeft.seconds}s`)

  return `${parts.join(' ')}`
}

const getAmPm = (hour: number): string => {
  const isAfternoon = hour >= 12
  return isAfternoon ? 'p.m.' : 'a.m.'
}

const to12HourFormat = (hour: number): number => {
  const hour12 = hour % 12
  const isMidnight = hour12 === 0
  return isMidnight ? 12 : hour12
}

const padWithZero = (num: number): string => num.toString().padStart(2, '0')

export const formatEndFromOffsets = (params: {
  now?: Date
  days: number
  hours: number
  minutes: number
}): string => {
  const { now = new Date(), days, hours, minutes } = params

  const durationMs = calculateMilliseconds({ days, hours, minutes })
  const endTime = new Date(now.getTime() + durationMs)

  const day = endTime.getDate()
  const month = endTime.getMonth() + 1
  const hour = endTime.getHours()
  const minute = endTime.getMinutes()

  const hour12 = to12HourFormat(hour)
  const minuteFormatted = padWithZero(minute)
  const period = getAmPm(hour)

  return `Ends ${day}/${month}, ${hour12}:${minuteFormatted} ${period}`
}
