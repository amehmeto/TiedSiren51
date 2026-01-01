import { describe, it, expect } from 'vitest'
import { blockSessionAdapter } from '@/core/block-session/block-session'
import { blocklistAdapter } from '@/core/blocklist/blocklist'
import { RootState } from '@/core/_redux_/createStore'
import { InMemoryDateProvider } from '@/infra/date-provider/in-memory.date-provider'
import { selectBlockingSchedule } from './selectBlockingSchedule'

describe('selectBlockingSchedule', () => {
  const dateProvider = new InMemoryDateProvider()

  it('should return empty windows when no active sessions exist', () => {
    const state: RootState = {
      blockSession: blockSessionAdapter.getInitialState(),
      blocklist: blocklistAdapter.getInitialState(),
    } as RootState

    const schedule = selectBlockingSchedule(state, dateProvider)

    expect(schedule.windows).toEqual([])
  })

  it('should join active sessions with fresh blocklist data', () => {
    dateProvider.setNow(new Date('2025-01-01T14:30:00Z'))

    const blocklist1 = {
      id: 'bl-1',
      name: 'Work Apps',
      sirens: {
        android: [{ packageName: 'com.facebook.katana', appName: 'Facebook', icon: '' }],
        ios: [],
        macos: [],
        windows: [],
        linux: [],
        websites: ['youtube.com'],
        keywords: ['gaming'],
      },
    }

    const blocklist2 = {
      id: 'bl-2',
      name: 'Social Media',
      sirens: {
        android: [{ packageName: 'com.instagram.android', appName: 'Instagram', icon: '' }],
        ios: [],
        macos: [],
        windows: [],
        linux: [],
        websites: ['twitter.com'],
        keywords: [],
      },
    }

    const session = {
      id: 'session-1',
      name: 'Focus Session',
      blocklists: [blocklist1, blocklist2],
      devices: [],
      startedAt: '2025-01-01T14:00:00Z',
      endedAt: '2025-01-01T15:00:00Z',
      startNotificationId: 'notif-1',
      endNotificationId: 'notif-2',
      blockingConditions: [],
    }

    const state: RootState = {
      blockSession: blockSessionAdapter.setAll(
        blockSessionAdapter.getInitialState(),
        [session],
      ),
      blocklist: blocklistAdapter.setAll(
        blocklistAdapter.getInitialState(),
        [blocklist1, blocklist2],
      ),
    } as RootState

    const schedule = selectBlockingSchedule(state, dateProvider)

    expect(schedule.windows).toHaveLength(1)
    expect(schedule.windows[0]).toEqual({
      id: 'session-1',
      startTime: expect.stringMatching(/^\d{2}:\d{2}$/),
      endTime: expect.stringMatching(/^\d{2}:\d{2}$/),
      sirens: {
        apps: ['com.facebook.katana', 'com.instagram.android'],
        websites: ['youtube.com', 'twitter.com'],
        keywords: ['gaming'],
      },
    })
  })

  it('should use fresh blocklist data, not stale embedded copies', () => {
    dateProvider.setNow(new Date('2025-01-01T14:30:00Z'))

    // Stale blocklist embedded in session
    const staleBlocklist = {
      id: 'bl-1',
      name: 'Old Apps',
      sirens: {
        android: [{ packageName: 'com.old.app', appName: 'Old App', icon: '' }],
        ios: [],
        macos: [],
        windows: [],
        linux: [],
        websites: [],
        keywords: [],
      },
    }

    // Fresh blocklist in state (user edited it)
    const freshBlocklist = {
      id: 'bl-1',
      name: 'Updated Apps',
      sirens: {
        android: [
          { packageName: 'com.new.app', appName: 'New App', icon: '' },
          { packageName: 'com.another.app', appName: 'Another App', icon: '' },
        ],
        ios: [],
        macos: [],
        windows: [],
        linux: [],
        websites: ['newsite.com'],
        keywords: ['new-keyword'],
      },
    }

    const session = {
      id: 'session-1',
      name: 'Focus Session',
      blocklists: [staleBlocklist], // Session has old data
      devices: [],
      startedAt: '2025-01-01T14:00:00Z',
      endedAt: '2025-01-01T15:00:00Z',
      startNotificationId: 'notif-1',
      endNotificationId: 'notif-2',
      blockingConditions: [],
    }

    const state: RootState = {
      blockSession: blockSessionAdapter.setAll(
        blockSessionAdapter.getInitialState(),
        [session],
      ),
      blocklist: blocklistAdapter.setAll(
        blocklistAdapter.getInitialState(),
        [freshBlocklist], // State has fresh data
      ),
    } as RootState

    const schedule = selectBlockingSchedule(state, dateProvider)

    // Should use fresh data, not stale embedded data
    expect(schedule.windows[0].sirens.apps).toEqual([
      'com.new.app',
      'com.another.app',
    ])
    expect(schedule.windows[0].sirens.apps).not.toContain('com.old.app')
    expect(schedule.windows[0].sirens.websites).toEqual(['newsite.com'])
    expect(schedule.windows[0].sirens.keywords).toEqual(['new-keyword'])
  })

  it('should deduplicate packages across multiple blocklists', () => {
    dateProvider.setNow(new Date('2025-01-01T14:30:00Z'))

    const blocklist1 = {
      id: 'bl-1',
      name: 'List 1',
      sirens: {
        android: [
          { packageName: 'com.facebook.katana', appName: 'Facebook', icon: '' },
          { packageName: 'com.duplicate.app', appName: 'Duplicate', icon: '' },
        ],
        ios: [],
        macos: [],
        windows: [],
        linux: [],
        websites: ['youtube.com', 'duplicate.com'],
        keywords: ['gaming', 'duplicate-keyword'],
      },
    }

    const blocklist2 = {
      id: 'bl-2',
      name: 'List 2',
      sirens: {
        android: [
          { packageName: 'com.duplicate.app', appName: 'Duplicate', icon: '' },
          { packageName: 'com.instagram.android', appName: 'Instagram', icon: '' },
        ],
        ios: [],
        macos: [],
        windows: [],
        linux: [],
        websites: ['duplicate.com', 'twitter.com'],
        keywords: ['duplicate-keyword', 'social'],
      },
    }

    const session = {
      id: 'session-1',
      name: 'Focus Session',
      blocklists: [blocklist1, blocklist2],
      devices: [],
      startedAt: '2025-01-01T14:00:00Z',
      endedAt: '2025-01-01T15:00:00Z',
      startNotificationId: 'notif-1',
      endNotificationId: 'notif-2',
      blockingConditions: [],
    }

    const state: RootState = {
      blockSession: blockSessionAdapter.setAll(
        blockSessionAdapter.getInitialState(),
        [session],
      ),
      blocklist: blocklistAdapter.setAll(
        blocklistAdapter.getInitialState(),
        [blocklist1, blocklist2],
      ),
    } as RootState

    const schedule = selectBlockingSchedule(state, dateProvider)

    // Each package should appear only once
    expect(schedule.windows[0].sirens.apps).toHaveLength(3)
    expect(schedule.windows[0].sirens.apps).toContain('com.facebook.katana')
    expect(schedule.windows[0].sirens.apps).toContain('com.duplicate.app')
    expect(schedule.windows[0].sirens.apps).toContain('com.instagram.android')

    expect(schedule.windows[0].sirens.websites).toHaveLength(3)
    expect(schedule.windows[0].sirens.websites).toContain('youtube.com')
    expect(schedule.windows[0].sirens.websites).toContain('duplicate.com')
    expect(schedule.windows[0].sirens.websites).toContain('twitter.com')

    expect(schedule.windows[0].sirens.keywords).toHaveLength(3)
    expect(schedule.windows[0].sirens.keywords).toContain('gaming')
    expect(schedule.windows[0].sirens.keywords).toContain('duplicate-keyword')
    expect(schedule.windows[0].sirens.keywords).toContain('social')
  })

  it('should skip deleted blocklists when joining', () => {
    dateProvider.setNow(new Date('2025-01-01T14:30:00Z'))

    const existingBlocklist = {
      id: 'bl-1',
      name: 'Existing',
      sirens: {
        android: [{ packageName: 'com.existing.app', appName: 'Existing', icon: '' }],
        ios: [],
        macos: [],
        windows: [],
        linux: [],
        websites: [],
        keywords: [],
      },
    }

    const deletedBlocklistRef = {
      id: 'bl-deleted',
      name: 'Deleted',
      sirens: {
        android: [{ packageName: 'com.deleted.app', appName: 'Deleted', icon: '' }],
        ios: [],
        macos: [],
        windows: [],
        linux: [],
        websites: [],
        keywords: [],
      },
    }

    const session = {
      id: 'session-1',
      name: 'Focus Session',
      blocklists: [existingBlocklist, deletedBlocklistRef], // References deleted blocklist
      devices: [],
      startedAt: '2025-01-01T14:00:00Z',
      endedAt: '2025-01-01T15:00:00Z',
      startNotificationId: 'notif-1',
      endNotificationId: 'notif-2',
      blockingConditions: [],
    }

    const state: RootState = {
      blockSession: blockSessionAdapter.setAll(
        blockSessionAdapter.getInitialState(),
        [session],
      ),
      blocklist: blocklistAdapter.setAll(
        blocklistAdapter.getInitialState(),
        [existingBlocklist], // Only existing blocklist in state
      ),
    } as RootState

    const schedule = selectBlockingSchedule(state, dateProvider)

    // Should only include apps from existing blocklist
    expect(schedule.windows[0].sirens.apps).toEqual(['com.existing.app'])
    expect(schedule.windows[0].sirens.apps).not.toContain('com.deleted.app')
  })

  it('should return multiple windows for multiple active sessions', () => {
    dateProvider.setNow(new Date('2025-01-01T14:30:00Z'))

    const blocklist1 = {
      id: 'bl-1',
      name: 'List 1',
      sirens: {
        android: [{ packageName: 'com.app1.android', appName: 'App 1', icon: '' }],
        ios: [],
        macos: [],
        windows: [],
        linux: [],
        websites: [],
        keywords: [],
      },
    }

    const blocklist2 = {
      id: 'bl-2',
      name: 'List 2',
      sirens: {
        android: [{ packageName: 'com.app2.android', appName: 'App 2', icon: '' }],
        ios: [],
        macos: [],
        windows: [],
        linux: [],
        websites: [],
        keywords: [],
      },
    }

    const session1 = {
      id: 'session-1',
      name: 'Morning Session',
      blocklists: [blocklist1],
      devices: [],
      startedAt: '2025-01-01T09:00:00Z',
      endedAt: '2025-01-01T12:00:00Z',
      startNotificationId: 'notif-1',
      endNotificationId: 'notif-2',
      blockingConditions: [],
    }

    const session2 = {
      id: 'session-2',
      name: 'Afternoon Session',
      blocklists: [blocklist2],
      devices: [],
      startedAt: '2025-01-01T13:00:00Z',
      endedAt: '2025-01-01T17:00:00Z',
      startNotificationId: 'notif-3',
      endNotificationId: 'notif-4',
      blockingConditions: [],
    }

    const state: RootState = {
      blockSession: blockSessionAdapter.setAll(
        blockSessionAdapter.getInitialState(),
        [session1, session2],
      ),
      blocklist: blocklistAdapter.setAll(
        blocklistAdapter.getInitialState(),
        [blocklist1, blocklist2],
      ),
    } as RootState

    const schedule = selectBlockingSchedule(state, dateProvider)

    expect(schedule.windows).toHaveLength(2)
    expect(schedule.windows[0].id).toBe('session-1')
    expect(schedule.windows[1].id).toBe('session-2')
  })
})
