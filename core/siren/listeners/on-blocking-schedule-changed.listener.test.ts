import { beforeEach, describe, expect, it } from 'vitest'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
  tikTokAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { blockingScheduleChangedFixture } from './blocking-schedule-changed.fixture'

describe('Feature: Blocking schedule changed listener', () => {
  let fixture: ReturnType<typeof blockingScheduleChangedFixture>

  beforeEach(() => {
    fixture = blockingScheduleChangedFixture()
  })

  describe('Scenario 1: Session created', () => {
    it('should sync blocked apps when new block session is created', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.storeIsCreated()

      await fixture.when.blockSessionsChange([
        buildBlockSession({
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
          ],
        }),
      ])

      fixture.then.blockingScheduleShouldContainApps(['com.facebook.katana'])
    })

    it('should clear blocked apps when session ends', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.initialBlockSessions([
        buildBlockSession({
          id: 'session-1',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
          ],
        }),
      ])
      fixture.given.storeIsCreated()

      await fixture.when.blockSessionsChange([])

      fixture.then.blockingScheduleShouldBeEmpty()
    })

    it('should sync combined apps from multiple active sessions', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.storeIsCreated()

      await fixture.when.blockSessionsChange([
        buildBlockSession({
          id: 'session-1',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
          ],
        }),
        buildBlockSession({
          id: 'session-2',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [instagramAndroidSiren] },
            }),
          ],
        }),
      ])

      fixture.then.blockingScheduleShouldContainApps([
        'com.facebook.katana',
        'com.example.instagram',
      ])
    })

    it('should deduplicate apps across multiple blocklists', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.storeIsCreated()

      await fixture.when.blockSessionsChange([
        buildBlockSession({
          id: 'session-1',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
            buildBlocklist({
              sirens: {
                android: [facebookAndroidSiren, instagramAndroidSiren],
              },
            }),
          ],
        }),
      ])

      fixture.then.blockingScheduleShouldContainApps([
        'com.facebook.katana',
        'com.example.instagram',
      ])
    })
  })

  describe('Scenario 2: Blocklist edited while session active', () => {
    it('should re-sync when android app added to blocklist during active session', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.initialBlockSessions([
        buildBlockSession({
          id: 'session-1',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [blocklist],
        }),
      ])
      fixture.given.storeIsCreated()

      await fixture.when.blocklistIsUpdated({
        ...blocklist,
        sirens: {
          ...blocklist.sirens,
          android: [facebookAndroidSiren, tikTokAndroidSiren],
        },
      })

      fixture.then.blockingScheduleShouldContainApps([
        'com.facebook.katana',
        'com.example.tiktok',
      ])
    })

    it('should re-sync when website added to blocklist during active session', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { websites: ['facebook.com'] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.initialBlockSessions([
        buildBlockSession({
          id: 'session-1',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [blocklist],
        }),
      ])
      fixture.given.storeIsCreated()

      await fixture.when.blocklistIsUpdated({
        ...blocklist,
        sirens: {
          ...blocklist.sirens,
          websites: ['facebook.com', 'twitter.com'],
        },
      })

      fixture.then.blockingScheduleShouldContainWebsites([
        'facebook.com',
        'twitter.com',
      ])
    })

    it('should re-sync when keyword added to blocklist during active session', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { keywords: ['gaming'] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.initialBlockSessions([
        buildBlockSession({
          id: 'session-1',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [blocklist],
        }),
      ])
      fixture.given.storeIsCreated()

      await fixture.when.blocklistIsUpdated({
        ...blocklist,
        sirens: {
          ...blocklist.sirens,
          keywords: ['gaming', 'social'],
        },
      })

      fixture.then.blockingScheduleShouldContainKeywords(['gaming', 'social'])
    })

    it('should re-sync when siren removed from blocklist during active session', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { android: [facebookAndroidSiren, tikTokAndroidSiren] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.initialBlockSessions([
        buildBlockSession({
          id: 'session-1',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [blocklist],
        }),
      ])
      fixture.given.storeIsCreated()

      await fixture.when.blocklistIsUpdated({
        ...blocklist,
        sirens: {
          ...blocklist.sirens,
          android: [facebookAndroidSiren],
        },
      })

      fixture.then.blockingScheduleShouldContainApps(['com.facebook.katana'])
    })
  })

  describe('Scenario 3: No unnecessary syncs', () => {
    it('should NOT sync when unrelated state changes', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.initialBlockSessions([
        buildBlockSession({
          id: 'session-1',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
          ],
        }),
      ])
      fixture.given.storeIsCreated()

      const initialCallCount = fixture.then.updateBlockingScheduleCallCount()

      await fixture.when.unrelatedStateChanges()

      const finalCallCount = fixture.then.updateBlockingScheduleCallCount()
      expect(finalCallCount).toBe(initialCallCount)
    })

    it('should NOT sync when blocklist edited but no active session', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.initialBlocklists([blocklist])
      fixture.given.storeIsCreated()

      const initialCallCount = fixture.then.updateBlockingScheduleCallCount()

      await fixture.when.blocklistIsUpdated({
        ...blocklist,
        sirens: {
          ...blocklist.sirens,
          android: [facebookAndroidSiren, tikTokAndroidSiren],
        },
      })

      const finalCallCount = fixture.then.updateBlockingScheduleCallCount()
      expect(finalCallCount).toBe(initialCallCount)
    })
  })

  describe('Foreground service and watching lifecycle', () => {
    it('should start foreground service and watching when session starts', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.storeIsCreated()

      await fixture.when.blockSessionsChange([
        buildBlockSession({
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
          ],
        }),
      ])

      fixture.then.foregroundServiceShouldBeStarted()
      fixture.then.watchingShouldBeStarted()
    })

    it('should stop foreground service and watching when all sessions end', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.initialBlockSessions([
        buildBlockSession({
          id: 'session-1',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
          ],
        }),
      ])
      fixture.given.storeIsCreated()

      await fixture.when.blockSessionsChange([])

      fixture.then.foregroundServiceShouldBeStopped()
      fixture.then.watchingShouldBeStopped()
    })
  })

  describe('Sessions outside active time window', () => {
    it('should not sync blocked apps for sessions outside active time', async () => {
      fixture.given.nowIs({ hours: 16, minutes: 30 })
      fixture.given.storeIsCreated()

      await fixture.when.blockSessionsChange([
        buildBlockSession({
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
          ],
        }),
      ])

      fixture.then.blockingScheduleShouldBeEmpty()
    })
  })

  describe('Error handling', () => {
    it('should log error when startWatching throws', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.startWatchingWillThrow()
      fixture.given.storeIsCreated()

      await fixture.when.blockSessionsChange([
        buildBlockSession({
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
          ],
        }),
      ])

      fixture.then.errorShouldBeLogged('Failed to start watching')
    })

    it('should log error when stopWatching throws', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.initialBlockSessions([
        buildBlockSession({
          id: 'session-1',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
          ],
        }),
      ])
      fixture.given.stopWatchingWillThrow()
      fixture.given.storeIsCreated()

      await fixture.when.blockSessionsChange([])

      fixture.then.errorShouldBeLogged('Failed to stop watching')
    })

    it('should log error when updateBlockingSchedule throws but continue protection', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.updateBlockingScheduleWillThrow()
      fixture.given.storeIsCreated()

      await fixture.when.blockSessionsChange([
        buildBlockSession({
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
          ],
        }),
      ])

      fixture.then.errorShouldBeLogged('Failed to update blocking schedule')
      fixture.then.watchingShouldBeStarted()
      fixture.then.foregroundServiceShouldBeStarted()
    })

    it('should log error when start foreground service throws', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.startForegroundServiceWillThrow()
      fixture.given.storeIsCreated()

      await fixture.when.blockSessionsChange([
        buildBlockSession({
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
          ],
        }),
      ])

      fixture.then.errorShouldBeLogged('Failed to start foreground service')
    })

    it('should log error when stop foreground service throws', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.initialBlockSessions([
        buildBlockSession({
          id: 'session-1',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren] },
            }),
          ],
        }),
      ])
      fixture.given.stopForegroundServiceWillThrow()
      fixture.given.storeIsCreated()

      await fixture.when.blockSessionsChange([])

      fixture.then.errorShouldBeLogged('Failed to stop foreground service')
    })
  })
})
