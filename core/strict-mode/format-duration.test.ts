import { describe, expect, test } from 'vitest'
import { DurationParts, formatDuration } from './format-duration'

describe('formatDuration', () => {
  test.each<[DurationParts, string]>([
    [{ days: 0, hours: 0, minutes: 0 }, '0 minutes'],
    [{ days: 1, hours: 0, minutes: 0 }, '1 day'],
    [{ days: 2, hours: 0, minutes: 0 }, '2 days'],
    [{ days: 0, hours: 1, minutes: 0 }, '1 hour'],
    [{ days: 0, hours: 3, minutes: 0 }, '3 hours'],
    [{ days: 0, hours: 0, minutes: 1 }, '1 minute'],
    [{ days: 0, hours: 0, minutes: 20 }, '20 minutes'],
    [{ days: 1, hours: 2, minutes: 0 }, '1 day, 2 hours'],
    [{ days: 0, hours: 1, minutes: 30 }, '1 hour, 30 minutes'],
    [{ days: 2, hours: 3, minutes: 45 }, '2 days, 3 hours, 45 minutes'],
    [{ days: 1, hours: 0, minutes: 30 }, '1 day, 30 minutes'],
  ])('should format %j as "%s"', (duration, expectedOutput) => {
    const formattedDuration = formatDuration(duration)

    expect(formattedDuration).toBe(expectedOutput)
  })
})
