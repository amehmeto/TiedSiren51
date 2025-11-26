import { describe, expect, test, beforeEach } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { buildTimer } from '@/core/_tests_/data-builders/timer.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { TimeUnit } from '../timer.utils'
import { selectTimeRemaining } from './selectTimeRemaining'

describe('selectTimeRemaining', () => {
  let dateProvider: StubDateProvider
  let now: number

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-01T10:00:00.000Z')
    now = dateProvider.getNow().getTime()
  })

  test('should return empty time when there is no timer', () => {
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withTimer(null).build(),
    )

    const timeRemaining = selectTimeRemaining(store.getState(), now)

    expect(timeRemaining).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
    })
  })

  test('should return empty time when timer is not active', () => {
    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withTimer(buildTimer({ baseTime: now, isActive: false }))
        .build(),
    )

    const timeRemaining = selectTimeRemaining(store.getState(), now)

    expect(timeRemaining).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
    })
  })

  test('should return empty time when timer has expired', () => {
    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withTimer(
          buildTimer({ baseTime: now, endTime: now - TimeUnit.SECOND }),
        )
        .build(),
    )

    const timeRemaining = selectTimeRemaining(store.getState(), now)

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
      duration: TimeUnit.HOUR,
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
      duration:
        TimeUnit.DAY +
        TimeUnit.HOUR * 2 +
        TimeUnit.MINUTE * 30 +
        TimeUnit.SECOND * 45,
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
      duration: TimeUnit.MINUTE * 30,
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
      duration: TimeUnit.SECOND * 45,
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
    ({ duration, expected }) => {
      const store = createTestStore(
        { dateProvider },
        stateBuilder()
          .withTimer(buildTimer({ baseTime: now, duration }))
          .build(),
      )

      const timeRemaining = selectTimeRemaining(store.getState(), now)

      expect(timeRemaining).toEqual(expected)
    },
  )

  test.each([
    {
      description: '61 seconds remaining',
      duration: TimeUnit.SECOND * 61,
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
      duration: TimeUnit.MINUTE,
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
      duration: TimeUnit.SECOND * 59,
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
      duration: TimeUnit.HOUR + TimeUnit.MINUTE + TimeUnit.SECOND,
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
      duration: TimeUnit.MINUTE * 2 + TimeUnit.SECOND * 5,
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
    ({ duration, expected }) => {
      const store = createTestStore(
        { dateProvider },
        stateBuilder()
          .withTimer(buildTimer({ baseTime: now, duration }))
          .build(),
      )

      const timeRemaining = selectTimeRemaining(store.getState(), now)

      expect(timeRemaining).toEqual(expected)
    },
  )
})
