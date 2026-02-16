import { beforeEach, describe, expect, test } from 'vitest'
import { assertISODateString } from '@/core/_ports_/date-provider'
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

  test.each<{
    scenario: string
    lastReauthenticatedAt: string
    shouldNeedReauth: boolean
  }>([
    {
      scenario: 'within 5 minutes',
      lastReauthenticatedAt: '2024-01-15T10:01:00.000Z',
      shouldNeedReauth: false,
    },
    {
      scenario: 'at exactly 5 minutes',
      lastReauthenticatedAt: '2024-01-15T10:00:00.000Z',
      shouldNeedReauth: true,
    },
    {
      scenario: 'after 5 minutes',
      lastReauthenticatedAt: '2024-01-15T09:59:59.000Z',
      shouldNeedReauth: true,
    },
  ])(
    'should return $shouldNeedReauth $scenario of re-authentication',
    ({ lastReauthenticatedAt, shouldNeedReauth }) => {
      assertISODateString(lastReauthenticatedAt)
      const store = createTestStore(
        { dateProvider },
        stateBuilder().withLastReauthenticatedAt(lastReauthenticatedAt).build(),
      )

      const shouldReauthenticate = selectNeedsReauthentication(
        store.getState(),
        dateProvider,
      )

      expect(shouldReauthenticate).toBe(shouldNeedReauth)
    },
  )
})
