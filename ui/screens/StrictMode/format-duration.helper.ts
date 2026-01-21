export const formatDuration = (duration: {
  days: number
  hours: number
  minutes: number
}): string => {
  const parts: string[] = []

  if (duration.days > 0)
    parts.push(`${duration.days} ${duration.days === 1 ? 'day' : 'days'}`)

  if (duration.hours > 0)
    parts.push(`${duration.hours} ${duration.hours === 1 ? 'hour' : 'hours'}`)

  if (duration.minutes > 0) {
    parts.push(
      `${duration.minutes} ${duration.minutes === 1 ? 'minute' : 'minutes'}`,
    )
  }

  return parts.join(', ') || '0 minutes'
}
