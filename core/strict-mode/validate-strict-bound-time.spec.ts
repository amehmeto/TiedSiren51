import { describe, expect, it } from 'vitest'
import { HHmmString, isHHmmString } from '@/core/_ports_/date-provider'
import {
  StrictBound,
  StrictBoundDirection,
  validateStrictBoundTime,
  validateStrictModeTime,
} from './validate-strict-bound-time'

/** Test helper to create HHmmString from string literal */
function asHHmm(time: string): HHmmString {
  if (!isHHmmString(time)) throw new Error(`Invalid HHmm format: ${time}`)
  return time
}

describe('validateStrictBoundTime', () => {
  describe('Earlier direction (start time - can only move earlier)', () => {
    const earlierBound: StrictBound = {
      direction: StrictBoundDirection.Earlier,
      initialTime: asHHmm('10:00'),
    }

    it.each<[string, string]>([
      ['09:00', 'earlier time'],
      ['10:00', 'same time'],
      ['09:59', 'one minute earlier'],
    ])('%s is valid (%s)', (time) => {
      const result = validateStrictBoundTime(asHHmm(time), earlierBound)

      expect(result.isValid).toBe(true)
    })

    it.each<[string, string]>([
      ['11:00', 'later time'],
      ['10:01', 'one minute later'],
    ])('%s is invalid (%s)', (time) => {
      const result = validateStrictBoundTime(asHHmm(time), earlierBound)

      expect(result.isValid).toBe(false)
      expect(result).toHaveProperty(
        'errorMessage',
        'Cannot set a later start time during strict mode',
      )
    })
  })

  describe('Later direction (end time - can only move later)', () => {
    const laterBound: StrictBound = {
      direction: StrictBoundDirection.Later,
      initialTime: asHHmm('18:00'),
    }

    it.each<[string, string]>([
      ['19:00', 'later time'],
      ['18:00', 'same time'],
      ['18:01', 'one minute later'],
    ])('%s is valid (%s)', (time) => {
      const result = validateStrictBoundTime(asHHmm(time), laterBound)

      expect(result.isValid).toBe(true)
    })

    it.each<[string, string]>([
      ['17:00', 'earlier time'],
      ['17:59', 'one minute earlier'],
    ])('%s is invalid (%s)', (time) => {
      const result = validateStrictBoundTime(asHHmm(time), laterBound)

      expect(result.isValid).toBe(false)
      expect(result).toHaveProperty(
        'errorMessage',
        'Cannot set an earlier end time during strict mode',
      )
    })
  })

  describe('midnight-spanning sessions (e.g., 23:00 → 04:00)', () => {
    describe('start time validation with otherBound', () => {
      const midnightSpanningStartBound: StrictBound = {
        direction: StrictBoundDirection.Earlier,
        initialTime: asHHmm('23:00'),
        otherBound: asHHmm('04:00'),
      }

      it.each<[string, string]>([
        ['22:00', 'earlier in evening zone'],
        ['21:00', 'earlier in evening zone'],
        ['05:00', 'after end time (valid evening zone)'],
      ])('%s is valid (%s)', (time) => {
        const result = validateStrictBoundTime(
          asHHmm(time),
          midnightSpanningStartBound,
        )

        expect(result.isValid).toBe(true)
      })

      it.each<[string, string]>([
        ['23:30', 'later than 23:00'],
        ['00:30', 'morning zone (after midnight)'],
        ['03:00', 'morning zone (before end time)'],
        ['04:00', 'equals end time (boundary)'],
      ])('%s is invalid (%s)', (time) => {
        const result = validateStrictBoundTime(
          asHHmm(time),
          midnightSpanningStartBound,
        )

        expect(result.isValid).toBe(false)
      })
    })

    describe('end time validation with otherBound', () => {
      const midnightSpanningEndBound: StrictBound = {
        direction: StrictBoundDirection.Later,
        initialTime: asHHmm('04:00'),
        otherBound: asHHmm('23:00'),
      }

      it.each<[string, string]>([
        ['05:00', 'later in morning zone'],
        ['06:00', 'later in morning zone'],
        ['22:00', 'before start time (valid morning zone)'],
      ])('%s is valid (%s)', (time) => {
        const result = validateStrictBoundTime(
          asHHmm(time),
          midnightSpanningEndBound,
        )

        expect(result.isValid).toBe(true)
      })

      it.each<[string, string]>([
        ['03:00', 'earlier than 04:00'],
        ['23:00', 'evening zone (at start time)'],
        ['23:30', 'evening zone (after start time)'],
      ])('%s is invalid (%s)', (time) => {
        const result = validateStrictBoundTime(
          asHHmm(time),
          midnightSpanningEndBound,
        )

        expect(result.isValid).toBe(false)
      })
    })
  })

  describe('time format consistency', () => {
    it.each<[string, string, StrictBoundDirection]>([
      ['08:59', '09:00', StrictBoundDirection.Earlier],
      ['01:06', '01:05', StrictBoundDirection.Later],
    ])('%s against %s (%s) is valid', (newTime, initialTime, direction) => {
      const bound: StrictBound = {
        direction,
        initialTime: asHHmm(initialTime),
      }

      const validationResult = validateStrictBoundTime(asHHmm(newTime), bound)
      expect(validationResult.isValid).toBe(true)
    })

    it.each<[string, string, StrictBoundDirection]>([
      ['09:01', '09:00', StrictBoundDirection.Earlier],
      ['01:04', '01:05', StrictBoundDirection.Later],
    ])('%s against %s (%s) is invalid', (newTime, initialTime, direction) => {
      const bound: StrictBound = {
        direction,
        initialTime: asHHmm(initialTime),
      }

      const validationResult = validateStrictBoundTime(asHHmm(newTime), bound)
      expect(validationResult.isValid).toBe(false)
    })
  })
})

describe('validateStrictModeTime', () => {
  const expectedValidResult = { isValid: true }

  it('allows any time change when strict mode is inactive', () => {
    const result = validateStrictModeTime({
      newTime: asHHmm('23:00'),
      isStrictModeActive: false,
      initialTime: asHHmm('10:00'),
      direction: StrictBoundDirection.Earlier,
    })

    expect(result).toStrictEqual(expectedValidResult)
  })

  it('allows any time change when initialTime is null', () => {
    const result = validateStrictModeTime({
      newTime: asHHmm('23:00'),
      isStrictModeActive: true,
      initialTime: null,
      direction: StrictBoundDirection.Earlier,
    })

    expect(result).toStrictEqual(expectedValidResult)
  })

  describe('when strict mode is active with initialTime', () => {
    it.each<[string, string, StrictBoundDirection, string]>([
      ['09:00', '10:00', StrictBoundDirection.Earlier, 'earlier start time'],
      ['19:00', '18:00', StrictBoundDirection.Later, 'later end time'],
    ])(
      '%s against %s (%s) is valid (%s)',
      (newTime, initialTime, direction) => {
        const result = validateStrictModeTime({
          newTime: asHHmm(newTime),
          isStrictModeActive: true,
          initialTime: asHHmm(initialTime),
          direction,
        })

        expect(result.isValid).toBe(true)
      },
    )

    it.each<[string, string, StrictBoundDirection, string]>([
      ['11:00', '10:00', StrictBoundDirection.Earlier, 'later start time'],
      ['17:00', '18:00', StrictBoundDirection.Later, 'earlier end time'],
    ])(
      '%s against %s (%s) is invalid (%s)',
      (newTime, initialTime, direction) => {
        const result = validateStrictModeTime({
          newTime: asHHmm(newTime),
          isStrictModeActive: true,
          initialTime: asHHmm(initialTime),
          direction,
        })

        expect(result.isValid).toBe(false)
      },
    )

    it('passes otherBound for midnight-spanning detection', () => {
      const result = validateStrictModeTime({
        newTime: asHHmm('00:30'),
        isStrictModeActive: true,
        initialTime: asHHmm('23:00'),
        direction: StrictBoundDirection.Earlier,
        otherBound: asHHmm('04:00'),
      })

      expect(result.isValid).toBe(false)
    })
  })
})
