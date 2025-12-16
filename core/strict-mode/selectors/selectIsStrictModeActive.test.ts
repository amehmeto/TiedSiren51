import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectIsStrictModeActive } from './selectIsStrictModeActive'

describe('selectIsStrictModeActive', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-01T10:00:00.000Z')
  })

  test('should return false when strict mode is not active', () => {
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withStrictModeEndedAt(null).build(),
    )

    const isActive = selectIsStrictModeActive(store.getState(), dateProvider)

    expect(isActive).toBe(false)
  })

  test('should return false when strict mode has expired', () => {
    const expiredEndedAt = '2024-01-01T09:59:59.000Z'
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withStrictModeEndedAt(expiredEndedAt).build(),
    )

    const isActive = selectIsStrictModeActive(store.getState(), dateProvider)

    expect(isActive).toBe(false)
  })

  test('should return true when strict mode endedAt is in the future', () => {
    const futureEndedAt = '2024-01-01T11:00:00.000Z'
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withStrictModeEndedAt(futureEndedAt).build(),
    )

    const isActive = selectIsStrictModeActive(store.getState(), dateProvider)

    expect(isActive).toBe(true)
  })
})
