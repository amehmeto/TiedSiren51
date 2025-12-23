import { beforeEach, describe, it } from 'vitest'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
  tikTokAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { onBlockSessionsChangedFixture } from './block-sessions-changed.fixture'

describe('Feature: Block sessions changed listener', () => {
  let fixture: ReturnType<typeof onBlockSessionsChangedFixture>

  beforeEach(() => {
    fixture = onBlockSessionsChangedFixture()
  })

  describe('Syncing blocked apps', () => {
    it('should sync blocked apps when session starts', async () => {
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

      fixture.then.blockedAppsShouldBeSyncedTo(['com.facebook.katana'])
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

      fixture.then.blockedAppsShouldBeEmpty()
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

      fixture.then.blockedAppsShouldBeSyncedTo([
        'com.facebook.katana',
        'com.example.instagram',
      ])
    })

    it('should re-sync when blocklist changes during active session', async () => {
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

      await fixture.when.blockSessionsChange([
        buildBlockSession({
          id: 'session-1',
          startedAt: '14:00',
          endedAt: '15:00',
          blocklists: [
            buildBlocklist({
              sirens: { android: [facebookAndroidSiren, tikTokAndroidSiren] },
            }),
          ],
        }),
      ])

      fixture.then.blockedAppsShouldBeSyncedTo([
        'com.facebook.katana',
        'com.example.tiktok',
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

      fixture.then.blockedAppsShouldBeSyncedTo([
        'com.facebook.katana',
        'com.example.instagram',
      ])
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

      fixture.then.blockedAppsShouldBeEmpty()
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

    it('should log error when syncBlockedApps throws but continue protection', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.syncBlockedAppsWillThrow()
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

      fixture.then.errorShouldBeLogged('Failed to sync blocked apps')
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
