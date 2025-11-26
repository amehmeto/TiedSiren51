import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { buildTimer } from '@/core/_tests_/data-builders/timer.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectIsTimerActive } from './selectIsTimerActive'

describe('selectIsTimerActive', () => {
  let dateProvider: StubDateProvider
  let now: number

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-01T10:00:00.000Z')
    now = dateProvider.getNow().getTime()
  })

  test('should return false when there is no timer', () => {
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withTimer(null).build(),
    )

    const isActive = selectIsTimerActive(store.getState(), now)

    expect(isActive).toBe(false)
  })

  test('should return false when timer has expired', () => {
    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withTimer(buildTimer({ endAt: now - 1000 }))
        .build(),
    )

    const isActive = selectIsTimerActive(store.getState(), now)

    expect(isActive).toBe(false)
  })

  test('should return true when timer endAt is in the future', () => {
    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withTimer(buildTimer({ endAt: now + 60000 }))
        .build(),
    )

    const isActive = selectIsTimerActive(store.getState(), now)

    expect(isActive).toBe(true)
  })
})
