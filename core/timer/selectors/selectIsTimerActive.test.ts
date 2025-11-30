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
      stateBuilder().withTimerEndedAt(null).build(),
    )

    const isActive = selectIsTimerActive(store.getState(), dateProvider)

    expect(isActive).toBe(false)
  })

  test('should return false when timer has expired', () => {
    const expiredEndedAt = '2024-01-01T09:59:59.000Z'
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withTimerEndedAt(expiredEndedAt).build(),
    )

    const isActive = selectIsTimerActive(store.getState(), dateProvider)

    expect(isActive).toBe(false)
  })

  test('should return true when timer endedAt is in the future', () => {
    const futureEndedAt = '2024-01-01T11:00:00.000Z'
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withTimerEndedAt(futureEndedAt).build(),
    )

    const isActive = selectIsTimerActive(store.getState(), dateProvider)

    expect(isActive).toBe(true)
  })
})
