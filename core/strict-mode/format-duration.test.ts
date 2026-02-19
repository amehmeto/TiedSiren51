import { describe, expect, test } from 'vitest'
import { formatDuration } from './format-duration'

describe('formatDuration', () => {
  test('should return "0 minutes" for all zeros', () => {
    const formattedDuration = formatDuration({ days: 0, hours: 0, minutes: 0 })

    expect(formattedDuration).toBe('0 minutes')
  })

  test('should format singular day correctly', () => {
    const formattedDuration = formatDuration({ days: 1, hours: 0, minutes: 0 })

    expect(formattedDuration).toBe('1 day')
  })

  test('should format plural days correctly', () => {
    const formattedDuration = formatDuration({ days: 2, hours: 0, minutes: 0 })

    expect(formattedDuration).toBe('2 days')
  })

  test('should format singular hour correctly', () => {
    const formattedDuration = formatDuration({ days: 0, hours: 1, minutes: 0 })

    expect(formattedDuration).toBe('1 hour')
  })

  test('should format plural hours correctly', () => {
    const formattedDuration = formatDuration({ days: 0, hours: 3, minutes: 0 })

    expect(formattedDuration).toBe('3 hours')
  })

  test('should format singular minute correctly', () => {
    const formattedDuration = formatDuration({ days: 0, hours: 0, minutes: 1 })

    expect(formattedDuration).toBe('1 minute')
  })

  test('should format plural minutes correctly', () => {
    const formattedDuration = formatDuration({ days: 0, hours: 0, minutes: 20 })

    expect(formattedDuration).toBe('20 minutes')
  })

  test('should combine days and hours', () => {
    const formattedDuration = formatDuration({ days: 1, hours: 2, minutes: 0 })

    expect(formattedDuration).toBe('1 day, 2 hours')
  })

  test('should combine hours and minutes', () => {
    const formattedDuration = formatDuration({ days: 0, hours: 1, minutes: 30 })

    expect(formattedDuration).toBe('1 hour, 30 minutes')
  })

  test('should combine all units', () => {
    const formattedDuration = formatDuration({ days: 2, hours: 3, minutes: 45 })

    expect(formattedDuration).toBe('2 days, 3 hours, 45 minutes')
  })

  test('should skip zero values in the middle', () => {
    const formattedDuration = formatDuration({ days: 1, hours: 0, minutes: 30 })

    expect(formattedDuration).toBe('1 day, 30 minutes')
  })
})
