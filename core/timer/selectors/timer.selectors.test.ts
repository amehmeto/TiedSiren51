import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import {
  buildTimer,
  timerWithRemainingTime,
} from '@/core/_tests_/data-builders/timer.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import {
  selectTimer,
  selectIsTimerActive,
  selectIsTimerLoading,
  selectTimeRemaining,
} from './timer.selectors'

describe('Timer Selectors', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('selectTimer', () => {
    test('should return null when there is no timer', () => {
      const store = createTestStore({}, stateBuilder().withTimer(null).build())

      const timer = selectTimer(store.getState())

      expect(timer).toBeNull()
    })

    test('should return timer when timer exists', () => {
      const timer = buildTimer()

      const store = createTestStore({}, stateBuilder().withTimer(timer).build())

      const selectedTimer = selectTimer(store.getState())

      expect(selectedTimer).toStrictEqual(timer)
    })
  })

  describe('selectIsTimerActive', () => {
    test('should return false when there is no timer', () => {
      const store = createTestStore({}, stateBuilder().withTimer(null).build())

      const isActive = selectIsTimerActive(store.getState())

      expect(isActive).toBe(false)
    })

    test('should return false when timer is not active', () => {
      const timer = timerWithRemainingTime.inactive()

      const store = createTestStore({}, stateBuilder().withTimer(timer).build())

      const isActive = selectIsTimerActive(store.getState())

      expect(isActive).toBe(false)
    })

    test('should return true when timer is active', () => {
      const timer = buildTimer()

      const store = createTestStore({}, stateBuilder().withTimer(timer).build())

      const isActive = selectIsTimerActive(store.getState())

      expect(isActive).toBe(true)
    })
  })

  describe('selectIsTimerLoading', () => {
    test('should return loading state from timer slice', () => {
      const store = createTestStore({}, stateBuilder().withTimer(null).build())

      const isLoading = selectIsTimerLoading(store.getState())

      expect(isLoading).toBe(true)
    })
  })

  describe('selectTimeRemaining', () => {
    test('should return empty time when there is no timer', () => {
      const store = createTestStore({}, stateBuilder().withTimer(null).build())

      const timeRemaining = selectTimeRemaining(store.getState())

      expect(timeRemaining).toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      })
    })

    test('should return empty time when timer is not active', () => {
      const timer = timerWithRemainingTime.inactive()

      const store = createTestStore({}, stateBuilder().withTimer(timer).build())

      const timeRemaining = selectTimeRemaining(store.getState())

      expect(timeRemaining).toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      })
    })

    test('should return empty time when timer has expired', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      const timer = timerWithRemainingTime.expired()

      const store = createTestStore({}, stateBuilder().withTimer(timer).build())

      const timeRemaining = selectTimeRemaining(store.getState())

      expect(timeRemaining).toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      })
    })

    test.each([
      {
        description: '1 hour',
        timerBuilder: timerWithRemainingTime.oneHour,
        expected: {
          days: 0,
          hours: 1,
          minutes: 0,
          seconds: 0,
          total: 3600000,
        },
      },
      {
        description: '1 day 2 hours 30 minutes 45 seconds',
        timerBuilder:
          timerWithRemainingTime.oneDayTwoHoursThirtyMinutesFortyFiveSeconds,
        expected: {
          days: 1,
          hours: 2,
          minutes: 30,
          seconds: 45,
          total: 86400000 + 7200000 + 1800000 + 45000,
        },
      },
      {
        description: '30 minutes',
        timerBuilder: timerWithRemainingTime.thirtyMinutes,
        expected: {
          days: 0,
          hours: 0,
          minutes: 30,
          seconds: 0,
          total: 1800000,
        },
      },
      {
        description: '45 seconds',
        timerBuilder: timerWithRemainingTime.fortyFiveSeconds,
        expected: {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 45,
          total: 45000,
        },
      },
    ])(
      'should calculate remaining time correctly for $description',
      ({ timerBuilder, expected }) => {
        const now = Date.now()
        vi.setSystemTime(now)

        const timer = timerBuilder()

        const store = createTestStore(
          {},
          stateBuilder().withTimer(timer).build(),
        )

        const timeRemaining = selectTimeRemaining(store.getState())

        expect(timeRemaining).toEqual(expected)
      },
    )

    test.each([
      {
        description: '61 seconds remaining',
        timerBuilder: timerWithRemainingTime.sixtyOneSeconds,
        expected: {
          days: 0,
          hours: 0,
          minutes: 1,
          seconds: 1,
          total: 61000,
        },
      },
      {
        description: '60 seconds remaining',
        timerBuilder: timerWithRemainingTime.sixtySeconds,
        expected: {
          days: 0,
          hours: 0,
          minutes: 1,
          seconds: 0,
          total: 60000,
        },
      },
      {
        description: '59 seconds remaining',
        timerBuilder: timerWithRemainingTime.fiftyNineSeconds,
        expected: {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 59,
          total: 59000,
        },
      },
      {
        description: '3661 seconds remaining (1 hour 1 minute 1 second)',
        timerBuilder: timerWithRemainingTime.oneHourOneMinuteOneSecond,
        expected: {
          days: 0,
          hours: 1,
          minutes: 1,
          seconds: 1,
          total: 3661000,
        },
      },
      {
        description: '125 seconds remaining (2 minutes 5 seconds)',
        timerBuilder: timerWithRemainingTime.twoMinutesFiveSeconds,
        expected: {
          days: 0,
          hours: 0,
          minutes: 2,
          seconds: 5,
          total: 125000,
        },
      },
    ])(
      'should calculate time remaining correctly for $description',
      ({ timerBuilder, expected }) => {
        const now = Date.now()
        vi.setSystemTime(now)

        const timer = timerBuilder()

        const store = createTestStore(
          {},
          stateBuilder().withTimer(timer).build(),
        )

        const timeRemaining = selectTimeRemaining(store.getState())

        expect(timeRemaining).toEqual(expected)
      },
    )
  })
})
