import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectNeedsReauthentication } from './selectNeedsReauthentication'

describe('selectNeedsReauthentication', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-15T10:05:00.000Z')
  })

  test('should return true when user has never re-authenticated', () => {
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withLastReauthenticatedAt(null).build(),
    )

    const shouldReauthenticate = selectNeedsReauthentication(
      store.getState(),
      dateProvider,
    )

    expect(shouldReauthenticate).toBe(true)
  })

  test('should return false within 5 minutes of re-authentication', () => {
    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withLastReauthenticatedAt('2024-01-15T10:01:00.000Z')
        .build(),
    )

    const shouldReauthenticate = selectNeedsReauthentication(
      store.getState(),
      dateProvider,
    )

    expect(shouldReauthenticate).toBe(false)
  })

  test('should return true after 5 minutes have elapsed', () => {
    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withLastReauthenticatedAt('2024-01-15T09:59:59.000Z')
        .build(),
    )

    const shouldReauthenticate = selectNeedsReauthentication(
      store.getState(),
      dateProvider,
    )

    expect(shouldReauthenticate).toBe(true)
  })
})
