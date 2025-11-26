import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectIsTimerActive } from './selectIsTimerActive'

describe('selectIsTimerActive', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-01T10:00:00.000Z')
  })

  test('should return false when there is no timer', () => {
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withTimerEndAt(null).build(),
    )

    const isActive = selectIsTimerActive(store.getState(), dateProvider)

    expect(isActive).toBe(false)
  })

  test('should return false when timer has expired', () => {
    const expiredEndAt = '2024-01-01T09:59:59.000Z'
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withTimerEndAt(expiredEndAt).build(),
    )

    const isActive = selectIsTimerActive(store.getState(), dateProvider)

    expect(isActive).toBe(false)
  })

  test('should return true when timer endAt is in the future', () => {
    const futureEndAt = '2024-01-01T11:00:00.000Z'
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withTimerEndAt(futureEndAt).build(),
    )

    const isActive = selectIsTimerActive(store.getState(), dateProvider)

    expect(isActive).toBe(true)
  })
})
