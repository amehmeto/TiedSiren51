import { beforeEach, describe, expect, test } from 'vitest'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectLockedSirensForBlocklist } from './selectLockedSirensForBlocklist'

describe('selectLockedSirensForBlocklist', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-01T10:00:00.000Z')
  })

  test('should return empty locked sirens when strict mode is not active', () => {
    const blocklist = buildBlocklist({
      id: 'blocklist-1',
      sirens: {
        android: [{ packageName: 'com.app1', appName: 'App1', icon: '' }],
        websites: ['example.com'],
        keywords: ['social'],
      },
    })
    const session = buildBlockSession({
      id: 'session-1',
      blocklistIds: ['blocklist-1'],
      startedAt: '09:00',
      endedAt: '11:00',
    })
    const state = stateBuilder()
      .withBlocklists([blocklist])
      .withBlockSessions([session])
      .withStrictModeEndedAt(null)
      .build()

    const retrievedLockedSirens = selectLockedSirensForBlocklist(
      state,
      dateProvider,
      'blocklist-1',
    )

    const androidSize = retrievedLockedSirens.android.size
    const websitesSize = retrievedLockedSirens.websites.size
    const keywordsSize = retrievedLockedSirens.keywords.size
    expect(androidSize).toBe(0)
    expect(websitesSize).toBe(0)
    expect(keywordsSize).toBe(0)
  })

  test('should return empty locked sirens when blocklist is not in any active/scheduled session', () => {
    const blocklist = buildBlocklist({
      id: 'blocklist-1',
      sirens: {
        android: [{ packageName: 'com.app1', appName: 'App1', icon: '' }],
        websites: ['example.com'],
        keywords: ['social'],
      },
    })
    const session = buildBlockSession({
      id: 'session-1',
      blocklistIds: ['other-blocklist-id'],
      startedAt: '09:00',
      endedAt: '11:00',
    })
    const state = stateBuilder()
      .withBlocklists([blocklist])
      .withBlockSessions([session])
      .withStrictModeEndedAt('2024-01-01T12:00:00.000Z')
      .build()

    const retrievedLockedSirens = selectLockedSirensForBlocklist(
      state,
      dateProvider,
      'blocklist-1',
    )

    const androidSize = retrievedLockedSirens.android.size
    const websitesSize = retrievedLockedSirens.websites.size
    const keywordsSize = retrievedLockedSirens.keywords.size
    expect(androidSize).toBe(0)
    expect(websitesSize).toBe(0)
    expect(keywordsSize).toBe(0)
  })

  test('should return locked sirens when strict mode is active and blocklist is in active session', () => {
    const blocklist = buildBlocklist({
      id: 'blocklist-1',
      sirens: {
        android: [
          { packageName: 'com.app1', appName: 'App1', icon: '' },
          { packageName: 'com.app2', appName: 'App2', icon: '' },
        ],
        websites: ['example.com', 'test.org'],
        keywords: ['social', 'gaming'],
      },
    })
    const session = buildBlockSession({
      id: 'session-1',
      blocklistIds: ['blocklist-1'],
      startedAt: '09:00',
      endedAt: '11:00',
    })
    const state = stateBuilder()
      .withBlocklists([blocklist])
      .withBlockSessions([session])
      .withStrictModeEndedAt('2024-01-01T12:00:00.000Z')
      .build()

    const retrievedLockedSirens = selectLockedSirensForBlocklist(
      state,
      dateProvider,
      'blocklist-1',
    )

    const hasApp1 = retrievedLockedSirens.android.has('com.app1')
    const hasApp2 = retrievedLockedSirens.android.has('com.app2')
    const hasExampleCom = retrievedLockedSirens.websites.has('example.com')
    const hasTestOrg = retrievedLockedSirens.websites.has('test.org')
    const hasSocial = retrievedLockedSirens.keywords.has('social')
    const hasGaming = retrievedLockedSirens.keywords.has('gaming')
    expect(hasApp1).toBe(true)
    expect(hasApp2).toBe(true)
    expect(hasExampleCom).toBe(true)
    expect(hasTestOrg).toBe(true)
    expect(hasSocial).toBe(true)
    expect(hasGaming).toBe(true)
  })

  test('should return locked sirens when blocklist is in scheduled (not active) session', () => {
    const blocklist = buildBlocklist({
      id: 'blocklist-1',
      sirens: {
        android: [{ packageName: 'com.app1', appName: 'App1', icon: '' }],
        websites: ['example.com'],
        keywords: ['social'],
      },
    })
    const scheduledSession = buildBlockSession({
      id: 'session-1',
      blocklistIds: ['blocklist-1'],
      startedAt: '14:00',
      endedAt: '16:00',
    })
    const state = stateBuilder()
      .withBlocklists([blocklist])
      .withBlockSessions([scheduledSession])
      .withStrictModeEndedAt('2024-01-01T12:00:00.000Z')
      .build()

    const retrievedLockedSirens = selectLockedSirensForBlocklist(
      state,
      dateProvider,
      'blocklist-1',
    )

    const hasApp1 = retrievedLockedSirens.android.has('com.app1')
    const hasExampleCom = retrievedLockedSirens.websites.has('example.com')
    const hasSocial = retrievedLockedSirens.keywords.has('social')
    expect(hasApp1).toBe(true)
    expect(hasExampleCom).toBe(true)
    expect(hasSocial).toBe(true)
  })

  test('should return empty locked sirens when blocklistId is undefined', () => {
    const state = stateBuilder()
      .withStrictModeEndedAt('2024-01-01T12:00:00.000Z')
      .build()

    const retrievedLockedSirens = selectLockedSirensForBlocklist(
      state,
      dateProvider,
      undefined,
    )

    const androidSize = retrievedLockedSirens.android.size
    const websitesSize = retrievedLockedSirens.websites.size
    const keywordsSize = retrievedLockedSirens.keywords.size
    expect(androidSize).toBe(0)
    expect(websitesSize).toBe(0)
    expect(keywordsSize).toBe(0)
  })

  test('should return cached result when blocklist sirens reference is unchanged', () => {
    const blocklist = buildBlocklist({
      id: 'blocklist-1',
      sirens: {
        android: [{ packageName: 'com.app1', appName: 'App1', icon: '' }],
        websites: ['example.com'],
        keywords: ['social'],
      },
    })
    const session = buildBlockSession({
      id: 'session-1',
      blocklistIds: ['blocklist-1'],
      startedAt: '09:00',
      endedAt: '11:00',
    })
    const state = stateBuilder()
      .withBlocklists([blocklist])
      .withBlockSessions([session])
      .withStrictModeEndedAt('2024-01-01T12:00:00.000Z')
      .build()

    const firstCall = selectLockedSirensForBlocklist(
      state,
      dateProvider,
      'blocklist-1',
    )
    const secondCall = selectLockedSirensForBlocklist(
      state,
      dateProvider,
      'blocklist-1',
    )

    expect(secondCall).toBe(firstCall)
  })

  test('should return empty when blocklist does not exist in state', () => {
    const session = buildBlockSession({
      id: 'session-1',
      blocklistIds: ['non-existent'],
      startedAt: '09:00',
      endedAt: '11:00',
    })
    const state = stateBuilder()
      .withBlockSessions([session])
      .withStrictModeEndedAt('2024-01-01T12:00:00.000Z')
      .build()

    const retrievedLockedSirens = selectLockedSirensForBlocklist(
      state,
      dateProvider,
      'non-existent',
    )

    const androidSize = retrievedLockedSirens.android.size
    const websitesSize = retrievedLockedSirens.websites.size
    const keywordsSize = retrievedLockedSirens.keywords.size
    expect(androidSize).toBe(0)
    expect(websitesSize).toBe(0)
    expect(keywordsSize).toBe(0)
  })
})
