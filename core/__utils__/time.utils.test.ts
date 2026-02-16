import { describe, expect, test } from 'vitest'
import { DAY, HOUR, MINUTE, SECOND } from '@/core/__constants__/time'
import { calculateMilliseconds, millisecondsToTimeUnits } from './time.utils'

describe('calculateMilliseconds', () => {
  test('should return 0 when no parameters provided', () => {
    const result = calculateMilliseconds({})

    expect(result).toBe(0)
  })

  test.each<{
    input: { seconds?: number; minutes?: number; hours?: number; days?: number }
    expected: number
  }>([
    { input: { seconds: 1 }, expected: 1 * SECOND },
    { input: { minutes: 1 }, expected: 1 * MINUTE },
    { input: { hours: 1 }, expected: 1 * HOUR },
    { input: { days: 1 }, expected: 1 * DAY },
  ])('should convert $input to $expected ms', ({ input, expected }) => {
    const result = calculateMilliseconds(input)

    expect(result).toBe(expected)
  })

  test('should combine all units correctly', () => {
    const result = calculateMilliseconds({
      days: 1,
      hours: 2,
      minutes: 30,
      seconds: 45,
    })

    expect(result).toBe(1 * DAY + 2 * HOUR + 30 * MINUTE + 45 * SECOND)
  })

  test('should handle partial parameters', () => {
    const result = calculateMilliseconds({
      hours: 1,
      seconds: 30,
    })

    expect(result).toBe(1 * HOUR + 30 * SECOND)
  })
})

describe('millisecondsToTimeUnits', () => {
  test('should return zeros for 0 milliseconds', () => {
    const expectedTimeUnits = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }

    const result = millisecondsToTimeUnits(0)

    expect(result).toStrictEqual(expectedTimeUnits)
  })

  test.each<{
    input: number
    expected: { days: number; hours: number; minutes: number; seconds: number }
  }>([
    {
      input: 1 * SECOND,
      expected: { days: 0, hours: 0, minutes: 0, seconds: 1 },
    },
    {
      input: 1 * MINUTE,
      expected: { days: 0, hours: 0, minutes: 1, seconds: 0 },
    },
    {
      input: 1 * HOUR,
      expected: { days: 0, hours: 1, minutes: 0, seconds: 0 },
    },
    {
      input: 1 * DAY,
      expected: { days: 1, hours: 0, minutes: 0, seconds: 0 },
    },
  ])('should convert $input ms to time units', ({ input, expected }) => {
    const result = millisecondsToTimeUnits(input)

    expect(result).toStrictEqual(expected)
  })

  test('should break down complex duration correctly', () => {
    const input = 1 * DAY + 2 * HOUR + 30 * MINUTE + 45 * SECOND
    const expectedTimeUnits = {
      days: 1,
      hours: 2,
      minutes: 30,
      seconds: 45,
    }

    const result = millisecondsToTimeUnits(input)

    expect(result).toStrictEqual(expectedTimeUnits)
  })

  test('should handle overflow correctly (e.g., 90 minutes becomes 1 hour 30 minutes)', () => {
    const input = 90 * MINUTE
    const expectedTimeUnits = {
      days: 0,
      hours: 1,
      minutes: 30,
      seconds: 0,
    }

    const result = millisecondsToTimeUnits(input)

    expect(result).toStrictEqual(expectedTimeUnits)
  })

  test('should floor partial seconds', () => {
    const input = 1 * SECOND + 500
    const expectedTimeUnits = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
    }

    const result = millisecondsToTimeUnits(input)

    expect(result).toStrictEqual(expectedTimeUnits)
  })

  test('should be inverse of calculateMilliseconds', () => {
    const original = { days: 2, hours: 5, minutes: 43, seconds: 12 }
    const ms = calculateMilliseconds(original)

    const result = millisecondsToTimeUnits(ms)

    expect(result).toStrictEqual(original)
  })
})
