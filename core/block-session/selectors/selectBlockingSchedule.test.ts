import { beforeEach, describe, expect, test } from 'vitest'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectBlockingSchedule } from './selectBlockingSchedule'

describe('selectBlockingSchedule', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
  })

  test('should return empty windows when no active sessions exist', () => {
    const state = stateBuilder().build()

    const schedule = selectBlockingSchedule(state, dateProvider)

    const windows = schedule.windows
    expect(windows).toStrictEqual([])
  })

  test('should join active sessions with fresh blocklist data', () => {
    dateProvider.now.setHours(10, 0, 0, 0)

    const blocklist = buildBlocklist({
      id: 'bl-1',
      sirens: {
        android: [
          { packageName: 'com.facebook.katana', appName: 'Facebook', icon: '' },
        ],
        websites: ['youtube.com'],
        keywords: ['gaming'],
      },
    })

    const session = buildBlockSession({
      id: 'session-1',
      startedAt: '09:00',
      endedAt: '11:00',
      blocklists: [blocklist],
    })

    const state = stateBuilder()
      .withBlockSessions([session])
      .withBlocklists([blocklist])
      .build()

    const schedule = selectBlockingSchedule(state, dateProvider)

    const expectedWindow = {
      id: 'session-1',
      startTime: '09:00',
      endTime: '11:00',
      sirens: {
        apps: ['com.facebook.katana'],
        websites: ['youtube.com'],
        keywords: ['gaming'],
      },
    }
    const firstWindow = schedule.windows[0]
    expect(schedule.windows).toHaveLength(1)
    expect(firstWindow).toStrictEqual(expectedWindow)
  })

  test('should use fresh blocklist data instead of stale embedded copies', () => {
    dateProvider.now.setHours(10, 0, 0, 0)

    const staleBlocklist = buildBlocklist({
      id: 'bl-1',
      sirens: {
        android: [{ packageName: 'com.old.app', appName: 'Old App', icon: '' }],
        websites: [],
        keywords: [],
      },
    })

    const freshBlocklist = buildBlocklist({
      id: 'bl-1',
      sirens: {
        android: [{ packageName: 'com.new.app', appName: 'New App', icon: '' }],
        websites: ['newsite.com'],
        keywords: ['new-keyword'],
      },
    })

    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklists: [staleBlocklist],
    })

    const state = stateBuilder()
      .withBlockSessions([session])
      .withBlocklists([freshBlocklist])
      .build()

    const schedule = selectBlockingSchedule(state, dateProvider)

    const expectedApps = ['com.new.app']
    const expectedWebsites = ['newsite.com']
    const expectedKeywords = ['new-keyword']
    const apps = schedule.windows[0].sirens.apps
    const websites = schedule.windows[0].sirens.websites
    const keywords = schedule.windows[0].sirens.keywords
    expect(apps).toStrictEqual(expectedApps)
    expect(apps).not.toContain('com.old.app')
    expect(websites).toStrictEqual(expectedWebsites)
    expect(keywords).toStrictEqual(expectedKeywords)
  })

  test('should deduplicate packages across multiple blocklists', () => {
    dateProvider.now.setHours(10, 0, 0, 0)

    const blocklist1 = buildBlocklist({
      id: 'bl-1',
      sirens: {
        android: [
          { packageName: 'com.facebook.katana', appName: 'Facebook', icon: '' },
          { packageName: 'com.duplicate.app', appName: 'Duplicate', icon: '' },
        ],
        websites: ['youtube.com', 'duplicate.com'],
        keywords: ['gaming', 'duplicate-keyword'],
      },
    })

    const blocklist2 = buildBlocklist({
      id: 'bl-2',
      sirens: {
        android: [
          { packageName: 'com.duplicate.app', appName: 'Duplicate', icon: '' },
          {
            packageName: 'com.instagram.android',
            appName: 'Instagram',
            icon: '',
          },
        ],
        websites: ['duplicate.com', 'twitter.com'],
        keywords: ['duplicate-keyword', 'social'],
      },
    })

    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklists: [blocklist1, blocklist2],
    })

    const state = stateBuilder()
      .withBlockSessions([session])
      .withBlocklists([blocklist1, blocklist2])
      .build()

    const schedule = selectBlockingSchedule(state, dateProvider)

    const apps = schedule.windows[0].sirens.apps
    const websites = schedule.windows[0].sirens.websites
    const keywords = schedule.windows[0].sirens.keywords
    expect(apps).toHaveLength(3)
    expect(apps).toContain('com.facebook.katana')
    expect(apps).toContain('com.duplicate.app')
    expect(apps).toContain('com.instagram.android')
    expect(websites).toHaveLength(3)
    expect(keywords).toHaveLength(3)
  })

  test('should skip deleted blocklists when joining', () => {
    dateProvider.now.setHours(10, 0, 0, 0)

    const existingBlocklist = buildBlocklist({
      id: 'bl-existing',
      sirens: {
        android: [
          { packageName: 'com.existing.app', appName: 'Existing', icon: '' },
        ],
        websites: [],
        keywords: [],
      },
    })

    const deletedBlocklistRef = buildBlocklist({
      id: 'bl-deleted',
      sirens: {
        android: [
          { packageName: 'com.deleted.app', appName: 'Deleted', icon: '' },
        ],
        websites: [],
        keywords: [],
      },
    })

    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklists: [existingBlocklist, deletedBlocklistRef],
    })

    const state = stateBuilder()
      .withBlockSessions([session])
      .withBlocklists([existingBlocklist])
      .build()

    const schedule = selectBlockingSchedule(state, dateProvider)

    const expectedApps = ['com.existing.app']
    const apps = schedule.windows[0].sirens.apps
    expect(apps).toStrictEqual(expectedApps)
    expect(apps).not.toContain('com.deleted.app')
  })

  test('should return multiple windows for multiple active sessions', () => {
    dateProvider.now.setHours(10, 0, 0, 0)

    const blocklist1 = buildBlocklist({
      id: 'bl-1',
      sirens: {
        android: [
          { packageName: 'com.app1.android', appName: 'App 1', icon: '' },
        ],
        websites: [],
        keywords: [],
      },
    })

    const blocklist2 = buildBlocklist({
      id: 'bl-2',
      sirens: {
        android: [
          { packageName: 'com.app2.android', appName: 'App 2', icon: '' },
        ],
        websites: [],
        keywords: [],
      },
    })

    const session1 = buildBlockSession({
      id: 'session-1',
      startedAt: '09:00',
      endedAt: '11:00',
      blocklists: [blocklist1],
    })

    const session2 = buildBlockSession({
      id: 'session-2',
      startedAt: '09:30',
      endedAt: '10:30',
      blocklists: [blocklist2],
    })

    const state = stateBuilder()
      .withBlockSessions([session1, session2])
      .withBlocklists([blocklist1, blocklist2])
      .build()

    const schedule = selectBlockingSchedule(state, dateProvider)

    const windowIds = schedule.windows.map((w) => w.id)
    expect(schedule.windows).toHaveLength(2)
    expect(windowIds).toContain('session-1')
    expect(windowIds).toContain('session-2')
  })
})
