import { describe, expect, it } from 'vitest'
import { assertHHmmString, HHmmString } from '@/core/_ports_/date-provider'
import {
  StrictBound,
  StrictBoundDirection,
  validateStrictBoundTime,
  validateStrictModeTime,
} from './validate-strict-bound-time'

/** Test helper to create HHmmString from string literal */
function asHHmm(time: string): HHmmString {
  assertHHmmString(time)
  return time
}

describe('validateStrictBoundTime', () => {
  describe('Earlier direction (start time - can only move earlier)', () => {
    const earlierBound: StrictBound = {
      direction: StrictBoundDirection.Earlier,
      initialTime: asHHmm('10:00'),
    }
    const validResult = { isValid: true }
    const invalidResult = {
      isValid: false,
      errorMessage: 'Cannot set a later start time during strict mode',
    }

    it('allows setting an earlier time than the initialTime', () => {
      const result = validateStrictBoundTime(asHHmm('09:00'), earlierBound)

      expect(result).toStrictEqual(validResult)
    })

    it('allows setting the same time as the initialTime', () => {
      const result = validateStrictBoundTime(asHHmm('10:00'), earlierBound)

      expect(result).toStrictEqual(validResult)
    })

    it('rejects setting a later time than the initialTime', () => {
      const result = validateStrictBoundTime(asHHmm('11:00'), earlierBound)

      expect(result).toStrictEqual(invalidResult)
    })

    it('rejects setting even one minute later', () => {
      const result = validateStrictBoundTime(asHHmm('10:01'), earlierBound)

      expect(result).toStrictEqual(invalidResult)
    })

    it('allows setting one minute earlier', () => {
      const result = validateStrictBoundTime(asHHmm('09:59'), earlierBound)

      expect(result).toStrictEqual(validResult)
    })
  })

  describe('Later direction (end time - can only move later)', () => {
    const laterBound: StrictBound = {
      direction: StrictBoundDirection.Later,
      initialTime: asHHmm('18:00'),
    }
    const validResult = { isValid: true }
    const invalidResult = {
      isValid: false,
      errorMessage: 'Cannot set an earlier end time during strict mode',
    }

    it('allows setting a later time than the initialTime', () => {
      const result = validateStrictBoundTime(asHHmm('19:00'), laterBound)

      expect(result).toStrictEqual(validResult)
    })

    it('allows setting the same time as the initialTime', () => {
      const result = validateStrictBoundTime(asHHmm('18:00'), laterBound)

      expect(result).toStrictEqual(validResult)
    })

    it('rejects setting an earlier time than the initialTime', () => {
      const result = validateStrictBoundTime(asHHmm('17:00'), laterBound)

      expect(result).toStrictEqual(invalidResult)
    })

    it('rejects setting even one minute earlier', () => {
      const result = validateStrictBoundTime(asHHmm('17:59'), laterBound)

      expect(result).toStrictEqual(invalidResult)
    })

    it('allows setting one minute later', () => {
      const result = validateStrictBoundTime(asHHmm('18:01'), laterBound)

      expect(result).toStrictEqual(validResult)
    })
  })

  describe('midnight-spanning sessions (e.g., 23:00 → 04:00)', () => {
    describe('start time validation with otherBound', () => {
      const midnightSpanningStartBound: StrictBound = {
        direction: StrictBoundDirection.Earlier,
        initialTime: asHHmm('23:00'),
        otherBound: asHHmm('04:00'),
      }
      const validResult = { isValid: true }
      const invalidResult = {
        isValid: false,
        errorMessage: 'Cannot set a later start time during strict mode',
      }

      it('allows 22:00 as earlier start time (evening zone)', () => {
        const result = validateStrictBoundTime(
          asHHmm('22:00'),
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(validResult)
      })

      it('allows 21:00 as earlier start time (evening zone)', () => {
        const result = validateStrictBoundTime(
          asHHmm('21:00'),
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(validResult)
      })

      it('rejects 23:30 as later than 23:00', () => {
        const result = validateStrictBoundTime(
          asHHmm('23:30'),
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('rejects 00:30 as it falls in the morning zone (after midnight)', () => {
        const result = validateStrictBoundTime(
          asHHmm('00:30'),
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('rejects 03:00 as it falls in the morning zone (before end time)', () => {
        const result = validateStrictBoundTime(
          asHHmm('03:00'),
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('rejects 04:00 as it equals the end time (boundary)', () => {
        const result = validateStrictBoundTime(
          asHHmm('04:00'),
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('allows 05:00 as it is after the end time (valid evening zone)', () => {
        const result = validateStrictBoundTime(
          asHHmm('05:00'),
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(validResult)
      })
    })

    describe('end time validation with otherBound', () => {
      const midnightSpanningEndBound: StrictBound = {
        direction: StrictBoundDirection.Later,
        initialTime: asHHmm('04:00'),
        otherBound: asHHmm('23:00'),
      }
      const validResult = { isValid: true }
      const invalidResult = {
        isValid: false,
        errorMessage: 'Cannot set an earlier end time during strict mode',
      }

      it('allows 05:00 as later end time (morning zone)', () => {
        const result = validateStrictBoundTime(
          asHHmm('05:00'),
          midnightSpanningEndBound,
        )

        expect(result).toStrictEqual(validResult)
      })

      it('allows 06:00 as later end time (morning zone)', () => {
        const result = validateStrictBoundTime(
          asHHmm('06:00'),
          midnightSpanningEndBound,
        )

        expect(result).toStrictEqual(validResult)
      })

      it('rejects 03:00 as earlier than 04:00', () => {
        const result = validateStrictBoundTime(
          asHHmm('03:00'),
          midnightSpanningEndBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('rejects 23:00 as it falls in the evening zone (at start time)', () => {
        const result = validateStrictBoundTime(
          asHHmm('23:00'),
          midnightSpanningEndBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('rejects 23:30 as it falls in the evening zone (after start time)', () => {
        const result = validateStrictBoundTime(
          asHHmm('23:30'),
          midnightSpanningEndBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('allows 22:00 as it is before start time (valid morning zone)', () => {
        const result = validateStrictBoundTime(
          asHHmm('22:00'),
          midnightSpanningEndBound,
        )

        expect(result).toStrictEqual(validResult)
      })
    })
  })

  describe('time format consistency', () => {
    it('compares times with leading zeros correctly', () => {
      const bound: StrictBound = {
        direction: StrictBoundDirection.Earlier,
        initialTime: asHHmm('09:00'),
      }

      expect(validateStrictBoundTime(asHHmm('08:59'), bound).isValid).toBe(true)
      expect(validateStrictBoundTime(asHHmm('09:01'), bound).isValid).toBe(
        false,
      )
    })

    it('handles single-digit-looking times in HH:mm format', () => {
      const bound: StrictBound = {
        direction: StrictBoundDirection.Later,
        initialTime: asHHmm('01:05'),
      }

      expect(validateStrictBoundTime(asHHmm('01:04'), bound).isValid).toBe(
        false,
      )
      expect(validateStrictBoundTime(asHHmm('01:06'), bound).isValid).toBe(true)
    })
  })
})

describe('validateStrictModeTime', () => {
  const validResult = { isValid: true }

  describe('when strict mode is inactive', () => {
    it('allows any time change', () => {
      const result = validateStrictModeTime({
        newTime: asHHmm('23:00'),
        isStrictModeActive: false,
        initialTime: asHHmm('10:00'),
        direction: StrictBoundDirection.Earlier,
      })

      expect(result).toStrictEqual(validResult)
    })
  })

  describe('when initialTime is null', () => {
    it('allows any time change', () => {
      const result = validateStrictModeTime({
        newTime: asHHmm('23:00'),
        isStrictModeActive: true,
        initialTime: null,
        direction: StrictBoundDirection.Earlier,
      })

      expect(result).toStrictEqual(validResult)
    })
  })

  describe('when strict mode is active with initialTime', () => {
    it('validates start time correctly', () => {
      const result = validateStrictModeTime({
        newTime: asHHmm('11:00'),
        isStrictModeActive: true,
        initialTime: asHHmm('10:00'),
        direction: StrictBoundDirection.Earlier,
      })

      expect(result.isValid).toBe(false)
    })

    it('validates end time correctly', () => {
      const result = validateStrictModeTime({
        newTime: asHHmm('17:00'),
        isStrictModeActive: true,
        initialTime: asHHmm('18:00'),
        direction: StrictBoundDirection.Later,
      })

      expect(result.isValid).toBe(false)
    })

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
