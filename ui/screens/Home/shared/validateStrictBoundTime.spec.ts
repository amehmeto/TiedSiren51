import { describe, expect, it } from 'vitest'
import {
  StrictBound,
  StrictBoundDirection,
  validateStrictBoundTime,
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

  describe('edge cases around midnight', () => {
    describe('late night start times', () => {
      const lateNightBound: StrictBound = {
        direction: StrictBoundDirection.Earlier,
        limit: '23:00',
      }
      const validResult = { isValid: true }

      it('allows 22:00 as earlier than 23:00', () => {
        const result = validateStrictBoundTime('22:00', lateNightBound)

        expect(result.isValid).toBe(true)
      })

      it('rejects 23:30 as later than 23:00', () => {
        const result = validateStrictBoundTime('23:30', lateNightBound)

        expect(result.isValid).toBe(false)
      })

      it('treats 00:30 as earlier than 23:00 (lexicographic)', () => {
        const result = validateStrictBoundTime('00:30', lateNightBound)

        expect(result).toStrictEqual(validResult)
      })
    })

    describe('early morning end times', () => {
      const earlyMorningBound: StrictBound = {
        direction: StrictBoundDirection.Later,
        limit: '02:00',
      }
      const validResult = { isValid: true }

      it('allows 03:00 as later than 02:00', () => {
        const result = validateStrictBoundTime('03:00', earlyMorningBound)

        expect(result.isValid).toBe(true)
      })

      it('rejects 01:00 as earlier than 02:00', () => {
        const result = validateStrictBoundTime('01:00', earlyMorningBound)

        expect(result.isValid).toBe(false)
      })

      it('treats 23:00 as later than 02:00 (lexicographic)', () => {
        const result = validateStrictBoundTime('23:00', earlyMorningBound)

        expect(result).toStrictEqual(validResult)
      })
    })

    describe('midnight boundary', () => {
      it('handles 00:00 as start time limit', () => {
        const midnightBound: StrictBound = {
          direction: StrictBoundDirection.Earlier,
          limit: '00:00',
        }

        const result = validateStrictBoundTime('00:01', midnightBound)

        expect(result.isValid).toBe(false)
      })

      it('handles 23:59 as end time limit', () => {
        const endOfDayBound: StrictBound = {
          direction: StrictBoundDirection.Later,
          limit: '23:59',
        }

        const result = validateStrictBoundTime('23:58', endOfDayBound)

        expect(result.isValid).toBe(false)
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
