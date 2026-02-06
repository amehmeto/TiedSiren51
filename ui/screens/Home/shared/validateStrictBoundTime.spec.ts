import { describe, expect, it } from 'vitest'
import {
  StrictBound,
  StrictBoundDirection,
  validateStrictBoundTime,
  validateStrictModeTime,
} from './validateStrictBoundTime'

describe('validateStrictBoundTime', () => {
  describe('Earlier direction (start time - can only move earlier)', () => {
    const earlierBound: StrictBound = {
      direction: StrictBoundDirection.Earlier,
      limit: '10:00',
    }
    const validResult = { isValid: true }
    const invalidResult = {
      isValid: false,
      errorMessage: 'Cannot set a later start time during strict mode',
    }

    it('allows setting an earlier time than the limit', () => {
      const result = validateStrictBoundTime('09:00', earlierBound)

      expect(result).toStrictEqual(validResult)
    })

    it('allows setting the same time as the limit', () => {
      const result = validateStrictBoundTime('10:00', earlierBound)

      expect(result).toStrictEqual(validResult)
    })

    it('rejects setting a later time than the limit', () => {
      const result = validateStrictBoundTime('11:00', earlierBound)

      expect(result).toStrictEqual(invalidResult)
    })

    it('rejects setting even one minute later', () => {
      const result = validateStrictBoundTime('10:01', earlierBound)

      expect(result).toStrictEqual(invalidResult)
    })

    it('allows setting one minute earlier', () => {
      const result = validateStrictBoundTime('09:59', earlierBound)

      expect(result).toStrictEqual(validResult)
    })
  })

  describe('Later direction (end time - can only move later)', () => {
    const laterBound: StrictBound = {
      direction: StrictBoundDirection.Later,
      limit: '18:00',
    }
    const validResult = { isValid: true }
    const invalidResult = {
      isValid: false,
      errorMessage: 'Cannot set an earlier end time during strict mode',
    }

    it('allows setting a later time than the limit', () => {
      const result = validateStrictBoundTime('19:00', laterBound)

      expect(result).toStrictEqual(validResult)
    })

    it('allows setting the same time as the limit', () => {
      const result = validateStrictBoundTime('18:00', laterBound)

      expect(result).toStrictEqual(validResult)
    })

    it('rejects setting an earlier time than the limit', () => {
      const result = validateStrictBoundTime('17:00', laterBound)

      expect(result).toStrictEqual(invalidResult)
    })

    it('rejects setting even one minute earlier', () => {
      const result = validateStrictBoundTime('17:59', laterBound)

      expect(result).toStrictEqual(invalidResult)
    })

    it('allows setting one minute later', () => {
      const result = validateStrictBoundTime('18:01', laterBound)

      expect(result).toStrictEqual(validResult)
    })
  })

  describe('midnight-spanning sessions (e.g., 23:00 → 04:00)', () => {
    describe('start time validation with otherBound', () => {
      const midnightSpanningStartBound: StrictBound = {
        direction: StrictBoundDirection.Earlier,
        limit: '23:00',
        otherBound: '04:00',
      }
      const validResult = { isValid: true }
      const invalidResult = {
        isValid: false,
        errorMessage: 'Cannot set a later start time during strict mode',
      }

      it('allows 22:00 as earlier start time (evening zone)', () => {
        const result = validateStrictBoundTime(
          '22:00',
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(validResult)
      })

      it('allows 21:00 as earlier start time (evening zone)', () => {
        const result = validateStrictBoundTime(
          '21:00',
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(validResult)
      })

      it('rejects 23:30 as later than 23:00', () => {
        const result = validateStrictBoundTime(
          '23:30',
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('rejects 00:30 as it falls in the morning zone (after midnight)', () => {
        const result = validateStrictBoundTime(
          '00:30',
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('rejects 03:00 as it falls in the morning zone (before end time)', () => {
        const result = validateStrictBoundTime(
          '03:00',
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('rejects 04:00 as it equals the end time (boundary)', () => {
        const result = validateStrictBoundTime(
          '04:00',
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('allows 05:00 as it is after the end time (valid evening zone)', () => {
        const result = validateStrictBoundTime(
          '05:00',
          midnightSpanningStartBound,
        )

        expect(result).toStrictEqual(validResult)
      })
    })

    describe('end time validation with otherBound', () => {
      const midnightSpanningEndBound: StrictBound = {
        direction: StrictBoundDirection.Later,
        limit: '04:00',
        otherBound: '23:00',
      }
      const validResult = { isValid: true }
      const invalidResult = {
        isValid: false,
        errorMessage: 'Cannot set an earlier end time during strict mode',
      }

      it('allows 05:00 as later end time (morning zone)', () => {
        const result = validateStrictBoundTime(
          '05:00',
          midnightSpanningEndBound,
        )

        expect(result).toStrictEqual(validResult)
      })

      it('allows 06:00 as later end time (morning zone)', () => {
        const result = validateStrictBoundTime(
          '06:00',
          midnightSpanningEndBound,
        )

        expect(result).toStrictEqual(validResult)
      })

      it('rejects 03:00 as earlier than 04:00', () => {
        const result = validateStrictBoundTime(
          '03:00',
          midnightSpanningEndBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('rejects 23:00 as it falls in the evening zone (at start time)', () => {
        const result = validateStrictBoundTime(
          '23:00',
          midnightSpanningEndBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('rejects 23:30 as it falls in the evening zone (after start time)', () => {
        const result = validateStrictBoundTime(
          '23:30',
          midnightSpanningEndBound,
        )

        expect(result).toStrictEqual(invalidResult)
      })

      it('allows 22:00 as it is before start time (valid morning zone)', () => {
        const result = validateStrictBoundTime(
          '22:00',
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
        limit: '09:00',
      }

      expect(validateStrictBoundTime('08:59', bound).isValid).toBe(true)
      expect(validateStrictBoundTime('09:01', bound).isValid).toBe(false)
    })

    it('handles single-digit-looking times in HH:mm format', () => {
      const bound: StrictBound = {
        direction: StrictBoundDirection.Later,
        limit: '01:05',
      }

      expect(validateStrictBoundTime('01:04', bound).isValid).toBe(false)
      expect(validateStrictBoundTime('01:06', bound).isValid).toBe(true)
    })
  })
})

describe('validateStrictModeTime', () => {
  const validResult = { isValid: true }

  describe('when strict mode is inactive', () => {
    it('allows any time change', () => {
      const result = validateStrictModeTime({
        newTime: '23:00',
        isStrictModeActive: false,
        initialTime: '10:00',
        direction: StrictBoundDirection.Earlier,
      })

      expect(result).toStrictEqual(validResult)
    })
  })

  describe('when initialTime is null', () => {
    it('allows any time change', () => {
      const result = validateStrictModeTime({
        newTime: '23:00',
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
        newTime: '11:00',
        isStrictModeActive: true,
        initialTime: '10:00',
        direction: StrictBoundDirection.Earlier,
      })

      expect(result.isValid).toBe(false)
    })

    it('validates end time correctly', () => {
      const result = validateStrictModeTime({
        newTime: '17:00',
        isStrictModeActive: true,
        initialTime: '18:00',
        direction: StrictBoundDirection.Later,
      })

      expect(result.isValid).toBe(false)
    })

    it('passes otherBound for midnight-spanning detection', () => {
      const result = validateStrictModeTime({
        newTime: '00:30',
        isStrictModeActive: true,
        initialTime: '23:00',
        direction: StrictBoundDirection.Earlier,
        otherBound: '04:00',
      })

      expect(result.isValid).toBe(false)
    })
  })
})
