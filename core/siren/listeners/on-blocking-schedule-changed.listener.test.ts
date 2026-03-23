import { beforeEach, describe, it } from 'vitest'
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
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })

      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      fixture.then.blockingScheduleShouldContainApps(['com.facebook.katana'])
    })

    it('should clear blocked apps when session ends', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      fixture.given.existingBlockSessions(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      await fixture.when.creatingBlockSession([])

      fixture.then.blockingScheduleShouldBeEmpty()
    })

    it('should sync combined apps from multiple active sessions', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      const blocklist1 = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      const blocklist2 = buildBlocklist({
        id: 'bl-2',
        sirens: { android: [instagramAndroidSiren] },
      })

      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist1.id],
          }),
          buildBlockSession({
            id: 'session-2',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist2.id],
          }),
        ],
        [blocklist1, blocklist2],
      )

      fixture.then.blockingScheduleShouldContainApps([
        'com.facebook.katana',
        'com.example.instagram',
      ])
    })

    it('should deduplicate apps across multiple blocklists', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      const blocklist1 = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      const blocklist2 = buildBlocklist({
        id: 'bl-2',
        sirens: {
          android: [facebookAndroidSiren, instagramAndroidSiren],
        },
      })

      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist1.id, blocklist2.id],
          }),
        ],
        [blocklist1, blocklist2],
      )

      fixture.then.blockingScheduleShouldContainApps([
        'com.facebook.katana',
        'com.example.instagram',
      ])
    })
  })

  describe('Scenario 2: Blocklist edited while session active', () => {
    it('should sync when android app added to blocklist during active session', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.existingBlockSessions(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      await fixture.when.updatingBlocklist({
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

    it('should sync when website added to blocklist during active session', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { websites: ['facebook.com'] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.existingBlockSessions(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      await fixture.when.updatingBlocklist({
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

    it('should sync when keyword added to blocklist during active session', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { keywords: ['gaming'] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.existingBlockSessions(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      await fixture.when.updatingBlocklist({
        ...blocklist,
        sirens: {
          ...blocklist.sirens,
          keywords: ['gaming', 'social'],
        },
      })

      fixture.then.blockingScheduleShouldContainKeywords(['gaming', 'social'])
    })

    it('should sync when siren removed from blocklist during active session', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { android: [facebookAndroidSiren, tikTokAndroidSiren] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.existingBlockSessions(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      await fixture.when.updatingBlocklist({
        ...blocklist,
        sirens: {
          ...blocklist.sirens,
          android: [facebookAndroidSiren],
        },
      })

      fixture.then.blockingScheduleShouldContainApps(['com.facebook.katana'])
    })

    it('should update schedule without toggling blocking lifecycle', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.existingBlockSessions(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      await fixture.when.updatingBlocklist({
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
      fixture.then.blockingShouldRemainActiveWithoutToggling()
    })
  })

  describe('Scenario 3: Blocklist edited without any session', () => {
    it('should NOT sync when blocklist edited but no session exists', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.existingBlocklists([blocklist])

      await fixture.when.updatingBlocklist({
        ...blocklist,
        sirens: {
          ...blocklist.sirens,
          android: [facebookAndroidSiren, tikTokAndroidSiren],
        },
      })

      fixture.then.blockingScheduleShouldNotHaveBeenSynced()
    })
  })

  describe('Scenario 4: Blocklist edited while session is scheduled (future)', () => {
    it('should sync updated blocklist for scheduled session without starting foreground', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      fixture.given.nowIs({ hours: 13, minutes: 30 })
      fixture.given.existingBlockSessions(
        [
          buildBlockSession({
            id: 'scheduled-session',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      await fixture.when.updatingBlocklist({
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
      fixture.then.foregroundServiceShouldNotBeRunning()
      fixture.then.sirenLookoutShouldBeWatchingPreemptively()
    })
  })

  describe('Scenario 5: App restart with active session', () => {
    it('should restore blocking when updating blocklist after app restart', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.existingBlockSessions(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      await fixture.when.updatingBlocklist({
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
      fixture.then.blockingShouldBeActive()
    })
  })

  describe('Blocking lifecycle', () => {
    it('should activate blocking when session starts', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })

      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      fixture.then.blockingShouldBeActive()
    })

    it('should deactivate blocking when all sessions end', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      fixture.given.existingBlockSessions(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      await fixture.when.creatingBlockSession([])

      fixture.then.blockingShouldBeInactive()
    })
  })

  describe('Active windows scheduling', () => {
    it('should set active windows when session is created', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })

      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      fixture.then.activeWindowsShouldBeSet([
        { startTime: '14:00', endTime: '15:00' },
      ])
    })

    it('should set active windows for multiple sessions', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      const blocklist1 = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      const blocklist2 = buildBlocklist({
        id: 'bl-2',
        sirens: { android: [instagramAndroidSiren] },
      })

      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist1.id],
          }),
          buildBlockSession({
            id: 'session-2',
            startedAt: '16:00',
            endedAt: '17:00',
            blocklistIds: [blocklist2.id],
          }),
        ],
        [blocklist1, blocklist2],
      )

      fixture.then.activeWindowsShouldBeSet([
        { startTime: '14:00', endTime: '15:00' },
        { startTime: '16:00', endTime: '17:00' },
      ])
    })

    it('should update active windows when blocklist is edited during active session', async () => {
      const blocklist = buildBlocklist({
        id: 'blocklist-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.existingBlockSessions(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      await fixture.when.updatingBlocklist({
        ...blocklist,
        sirens: {
          ...blocklist.sirens,
          android: [facebookAndroidSiren, tikTokAndroidSiren],
        },
      })

      fixture.then.activeWindowsShouldBeSet([
        { startTime: '14:00', endTime: '15:00' },
      ])
    })

    it('should clear active windows when all sessions end', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      fixture.given.existingBlockSessions(
        [
          buildBlockSession({
            id: 'session-1',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      await fixture.when.creatingBlockSession([])

      fixture.then.activeWindowsShouldBeSet([])
    })

    it('should schedule future windows when active session ends but future session remains', async () => {
      fixture.given.nowIs({ hours: 15, minutes: 30 })
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })
      fixture.given.existingBlockSessions(
        [
          buildBlockSession({
            id: 'session-active',
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
          buildBlockSession({
            id: 'session-future',
            startedAt: '16:00',
            endedAt: '17:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      // Remove the ended session, leaving only the future one
      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            id: 'session-future',
            startedAt: '16:00',
            endedAt: '17:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      fixture.then.foregroundServiceShouldNotBeRunning()
      fixture.then.activeWindowsShouldBeSet([
        { startTime: '16:00', endTime: '17:00' },
      ])
      fixture.then.sirenLookoutShouldBeWatchingPreemptively()
    })

    it('should set active windows for future scheduled session', async () => {
      fixture.given.nowIs({ hours: 13, minutes: 30 })
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })

      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      fixture.then.activeWindowsShouldBeSet([
        { startTime: '14:00', endTime: '15:00' },
      ])
      fixture.then.foregroundServiceShouldNotBeRunning()
      fixture.then.sirenLookoutShouldBeWatchingPreemptively()
    })
  })

  describe('Sessions outside active time window', () => {
    it('should sync scheduled sessions but not start foreground when outside active time', async () => {
      fixture.given.nowIs({ hours: 16, minutes: 30 })
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })

      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      fixture.then.blockingScheduleShouldContainApps(['com.facebook.katana'])
      fixture.then.blockingShouldBeInactive()
    })
  })

  describe('Error handling', () => {
    it('should log error when updateBlockingSchedule fails', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      fixture.given.updateBlockingScheduleWillThrow()
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })

      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      fixture.then.errorShouldBeLogged('BlockingScheduleListener')
    })
  })

  describe('Native service start detection', () => {
    it('should start watching and detect current app when service starts natively during active session', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })

      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      // Simulate native alarm starting the service while session is active
      fixture.when.simulatingNativeServiceStart()

      fixture.then.sirenLookoutShouldBeWatchingPreemptively()
      fixture.then.detectCurrentAppShouldHaveBeenCalled()
    })

    it('should not detect current app when service starts but no active session', async () => {
      fixture.given.nowIs({ hours: 13, minutes: 30 })
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })

      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      // Service starts but time is still before the session
      fixture.when.simulatingNativeServiceStart()

      fixture.then.detectCurrentAppShouldNotHaveBeenCalled()
    })

    it('should not react when service stops', async () => {
      fixture.given.nowIs({ hours: 14, minutes: 30 })
      const blocklist = buildBlocklist({
        id: 'bl-1',
        sirens: { android: [facebookAndroidSiren] },
      })

      await fixture.when.creatingBlockSession(
        [
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ],
        [blocklist],
      )

      fixture.when.simulatingNativeServiceStop()

      fixture.then.detectCurrentAppShouldNotHaveBeenCalled()
    })
  })
})
