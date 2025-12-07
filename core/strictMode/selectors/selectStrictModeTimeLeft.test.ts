import { describe, expect, test, beforeEach } from 'vitest'
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
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withStrictModeEndedAt(null).build(),
    )
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
    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withStrictModeEndedAt(dateProvider.msToISOString(nowMs - 1 * SECOND))
        .build(),
    )
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
        totalMs: 3600000,
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
        totalMs: 86400000 + 7200000 + 1800000 + 45000,
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
        totalMs: 1800000,
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
        totalMs: 45000,
      },
    },
  ])(
    'should calculate remaining time correctly for $description',
    ({ remainingMs, expected }) => {
      const store = createTestStore(
        { dateProvider },
        stateBuilder()
          .withStrictModeEndedAt(
            dateProvider.msToISOString(nowMs + remainingMs),
          )
          .build(),
      )

      const timeLeft = selectStrictModeTimeLeft(store.getState(), dateProvider)

      expect(timeLeft).toStrictEqual(expected)
    },
  )

  test.each([
    {
      description: '61 seconds remaining',
      remainingMs: 61 * SECOND,
      expected: {
        days: 0,
        hours: 0,
        minutes: 1,
        seconds: 1,
        totalMs: 61000,
      },
    },
    {
      description: '60 seconds remaining',
      remainingMs: 1 * MINUTE,
      expected: {
        days: 0,
        hours: 0,
        minutes: 1,
        seconds: 0,
        totalMs: 60000,
      },
    },
    {
      description: '59 seconds remaining',
      remainingMs: 59 * SECOND,
      expected: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 59,
        totalMs: 59000,
      },
    },
    {
      description: '3661 seconds remaining (1 hour 1 minute 1 second)',
      remainingMs: 1 * HOUR + 1 * MINUTE + 1 * SECOND,
      expected: {
        days: 0,
        hours: 1,
        minutes: 1,
        seconds: 1,
        totalMs: 3661000,
      },
    },
    {
      description: '125 seconds remaining (2 minutes 5 seconds)',
      remainingMs: 2 * MINUTE + 5 * SECOND,
      expected: {
        days: 0,
        hours: 0,
        minutes: 2,
        seconds: 5,
        totalMs: 125000,
      },
    },
  ])(
    'should calculate time remaining correctly for $description',
    ({ remainingMs, expected }) => {
      const store = createTestStore(
        { dateProvider },
        stateBuilder()
          .withStrictModeEndedAt(
            dateProvider.msToISOString(nowMs + remainingMs),
          )
          .build(),
      )

      const timeLeft = selectStrictModeTimeLeft(store.getState(), dateProvider)

      expect(timeLeft).toStrictEqual(expected)
    },
  )
})
