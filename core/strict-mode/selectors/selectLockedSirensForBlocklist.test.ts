import { beforeEach, describe, expect, test } from 'vitest'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import {
  isSirenLocked,
  selectLockedSirensForBlocklist,
} from './selectLockedSirensForBlocklist'

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

  test('should return empty when blocklist does not exist', () => {
    const state = stateBuilder()
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

describe('isSirenLocked', () => {
  test('should return true when android siren is locked', () => {
    const lockedSirens = {
      android: new Set(['com.app1']),
      websites: new Set<string>(),
      keywords: new Set<string>(),
    }

    const isApp1Locked = isSirenLocked(lockedSirens, 'android', 'com.app1')
    const isApp2Locked = isSirenLocked(lockedSirens, 'android', 'com.app2')

    expect(isApp1Locked).toBe(true)
    expect(isApp2Locked).toBe(false)
  })

  test('should return true when website siren is locked', () => {
    const lockedSirens = {
      android: new Set<string>(),
      websites: new Set(['example.com']),
      keywords: new Set<string>(),
    }

    const isExampleLocked = isSirenLocked(
      lockedSirens,
      'websites',
      'example.com',
    )
    const isOtherLocked = isSirenLocked(lockedSirens, 'websites', 'other.com')

    expect(isExampleLocked).toBe(true)
    expect(isOtherLocked).toBe(false)
  })

  test('should return true when keyword siren is locked', () => {
    const lockedSirens = {
      android: new Set<string>(),
      websites: new Set<string>(),
      keywords: new Set(['social']),
    }

    const isSocialLocked = isSirenLocked(lockedSirens, 'keywords', 'social')
    const isOtherLocked = isSirenLocked(lockedSirens, 'keywords', 'other')

    expect(isSocialLocked).toBe(true)
    expect(isOtherLocked).toBe(false)
  })

  test('should return false for unsupported siren types', () => {
    const lockedSirens = {
      android: new Set<string>(),
      websites: new Set<string>(),
      keywords: new Set<string>(),
    }

    const isIosLocked = isSirenLocked(lockedSirens, 'ios', 'something')
    const isWindowsLocked = isSirenLocked(lockedSirens, 'windows', 'something')

    expect(isIosLocked).toBe(false)
    expect(isWindowsLocked).toBe(false)
  })
})
