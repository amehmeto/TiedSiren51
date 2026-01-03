import { beforeEach, describe, expect, test } from 'vitest'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
  tikTokAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
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

  test('should return blocking schedule for active sessions', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const blocklist = buildBlocklist({
      sirens: { android: [facebookAndroidSiren] },
    })
    const activeSession = buildBlockSession({
      id: 'active-session',
      startedAt: '09:00',
      endedAt: '11:00',
      blocklists: [blocklist],
    })
    const state = stateBuilder()
      .withBlockSessions([activeSession])
      .withBlocklists([blocklist])
      .build()

    const schedule = selectBlockingSchedule(dateProvider, state)

    const firstSchedule = schedule[0]
    const firstScheduleId = firstSchedule.id
    const androidSirens = firstSchedule.sirens.android
    expect(schedule).toHaveLength(1)
    expect(firstScheduleId).toBe('active-session')
    expect(androidSirens).toContainEqual(facebookAndroidSiren)
  })

  test('should deduplicate apps across blocklists', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const blocklist1 = buildBlocklist({
      sirens: { android: [facebookAndroidSiren] },
    })
    const blocklist2 = buildBlocklist({
      sirens: { android: [facebookAndroidSiren, instagramAndroidSiren] },
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

    const schedule = selectBlockingSchedule(dateProvider, state)

    const androidSirens = schedule[0].sirens.android
    expect(androidSirens).toHaveLength(2)
    expect(androidSirens).toContainEqual(facebookAndroidSiren)
    expect(androidSirens).toContainEqual(instagramAndroidSiren)
  })

  test('should return empty array for inactive sessions', () => {
    dateProvider.now.setHours(8, 0, 0, 0)
    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
    })
    const state = stateBuilder().withBlockSessions([session]).build()

    const schedule = selectBlockingSchedule(dateProvider, state)

    expect(schedule).toHaveLength(0)
  })

  test('should return empty array when no sessions exist', () => {
    const state = stateBuilder().build()

    const schedule = selectBlockingSchedule(dateProvider, state)

    expect(schedule).toHaveLength(0)
  })

  test('should use fresh blocklist data instead of stale embedded copies', () => {
    dateProvider.now.setHours(10, 0, 0, 0)

    // Stale blocklist embedded in session (old data)
    const staleBlocklist = buildBlocklist({
      id: 'bl-1',
      sirens: { android: [facebookAndroidSiren] },
    })

    // Fresh blocklist in state (updated data)
    const freshBlocklist = buildBlocklist({
      id: 'bl-1',
      sirens: { android: [tikTokAndroidSiren] },
    })

    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklists: [staleBlocklist],
    })

    // State has fresh blocklist, session has stale embedded copy
    const state = stateBuilder()
      .withBlockSessions([session])
      .withBlocklists([freshBlocklist])
      .build()

    const schedule = selectBlockingSchedule(dateProvider, state)

    const androidSirens = schedule[0].sirens.android
    expect(androidSirens).toContainEqual(tikTokAndroidSiren)
    expect(androidSirens).not.toContainEqual(facebookAndroidSiren)
  })

  test('should fall back to embedded data when blocklist is deleted', () => {
    dateProvider.now.setHours(10, 0, 0, 0)

    const blocklist = buildBlocklist({
      id: 'bl-deleted',
      sirens: { android: [facebookAndroidSiren] },
    })

    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklists: [blocklist],
    })

    // Session references blocklist but it's not in state (deleted)
    const state = stateBuilder()
      .withBlockSessions([session])
      .withBlocklists([]) // No blocklists in state
      .build()

    const schedule = selectBlockingSchedule(dateProvider, state)

    // Should fall back to embedded blocklist data
    const androidSirens = schedule[0].sirens.android
    expect(androidSirens).toContainEqual(facebookAndroidSiren)
  })
})
