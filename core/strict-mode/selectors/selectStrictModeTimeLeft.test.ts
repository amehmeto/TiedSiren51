import { beforeEach, describe, expect, test } from 'vitest'
import { DAY, HOUR, MINUTE, SECOND } from '@/core/__constants__/time'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectStrictModeTimeLeft } from './selectStrictModeTimeLeft'

describe('selectStrictModeTimeLeft', () => {
  let dateProvider: StubDateProvider
  let nowMs: number

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-01T10:00:00.000Z')
    nowMs = dateProvider.getNow().getTime()
  })

  test('should return empty time when strict mode is not active', () => {
    const stateWithNullStrictMode = stateBuilder()
      .withStrictModeEndedAt(null)
      .build()
    const store = createTestStore({ dateProvider }, stateWithNullStrictMode)
    const expectedTimeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
    }

    const timeLeft = selectStrictModeTimeLeft(store.getState(), dateProvider)

    expect(timeLeft).toStrictEqual(expectedTimeLeft)
  })

  test('should return empty time when strict mode has expired', () => {
    const expiredDate = dateProvider.msToISOString(nowMs - 1 * SECOND)
    const stateWithExpiredStrictMode = stateBuilder()
      .withStrictModeEndedAt(expiredDate)
      .build()
    const store = createTestStore({ dateProvider }, stateWithExpiredStrictMode)
    const expectedTimeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
    }

    const timeLeft = selectStrictModeTimeLeft(store.getState(), dateProvider)

    expect(timeLeft).toStrictEqual(expectedTimeLeft)
  })

  test.each([
    {
      description: '1 hour',
      remainingMs: 1 * HOUR,
      expected: {
        days: 0,
        hours: 1,
        minutes: 0,
        seconds: 0,
        totalMs: 1 * HOUR,
      },
    },
    {
      description: '1 day 2 hours 30 minutes 45 seconds',
      remainingMs: 1 * DAY + 2 * HOUR + 30 * MINUTE + 45 * SECOND,
      expected: {
        days: 1,
        hours: 2,
        minutes: 30,
        seconds: 45,
        totalMs: 1 * DAY + 2 * HOUR + 30 * MINUTE + 45 * SECOND,
      },
    },
    {
      description: '30 minutes',
      remainingMs: 30 * MINUTE,
      expected: {
        days: 0,
        hours: 0,
        minutes: 30,
        seconds: 0,
        totalMs: 30 * MINUTE,
      },
    },
    {
      description: '45 seconds',
      remainingMs: 45 * SECOND,
      expected: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 45,
        totalMs: 45 * SECOND,
      },
    },
    {
      description: '61 seconds (1 minute 1 second)',
      remainingMs: 61 * SECOND,
      expected: {
        days: 0,
        hours: 0,
        minutes: 1,
        seconds: 1,
        totalMs: 61 * SECOND,
      },
    },
    {
      description: '60 seconds (1 minute)',
      remainingMs: 1 * MINUTE,
      expected: {
        days: 0,
        hours: 0,
        minutes: 1,
        seconds: 0,
        totalMs: 1 * MINUTE,
      },
    },
    {
      description: '59 seconds',
      remainingMs: 59 * SECOND,
      expected: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 59,
        totalMs: 59 * SECOND,
      },
    },
    {
      description: '1 hour 1 minute 1 second',
      remainingMs: 1 * HOUR + 1 * MINUTE + 1 * SECOND,
      expected: {
        days: 0,
        hours: 1,
        minutes: 1,
        seconds: 1,
        totalMs: 1 * HOUR + 1 * MINUTE + 1 * SECOND,
      },
    },
    {
      description: '2 minutes 5 seconds',
      remainingMs: 2 * MINUTE + 5 * SECOND,
      expected: {
        days: 0,
        hours: 0,
        minutes: 2,
        seconds: 5,
        totalMs: 2 * MINUTE + 5 * SECOND,
      },
    },
  ])(
    'should calculate remaining time correctly for $description',
    ({ remainingMs, expected }) => {
      const endedAt = dateProvider.msToISOString(nowMs + remainingMs)
      const stateWithStrictModeEndedAt = stateBuilder()
        .withStrictModeEndedAt(endedAt)
        .build()
      const store = createTestStore(
        { dateProvider },
        stateWithStrictModeEndedAt,
      )

      const timeLeft = selectStrictModeTimeLeft(store.getState(), dateProvider)

      expect(timeLeft).toStrictEqual(expected)
    },
  )
})
