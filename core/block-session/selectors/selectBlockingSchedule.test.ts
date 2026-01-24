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
      id: 'bl-1',
      sirens: { android: [facebookAndroidSiren] },
    })
    const activeSession = buildBlockSession({
      id: 'active-session',
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: [blocklist.id],
    })
    const state = stateBuilder()
      .withBlockSessions([activeSession])
      .withBlocklists([blocklist])
      .build()

    const schedule = selectBlockingSchedule(dateProvider, state)

    const [firstSchedule] = schedule
    const firstScheduleId = firstSchedule.id
    const androidSirens = firstSchedule.sirens.android
    expect(schedule).toHaveLength(1)
    expect(firstScheduleId).toBe('active-session')
    expect(androidSirens).toContainEqual(facebookAndroidSiren)
  })

  test('should deduplicate sirens across blocklists', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const blocklist1 = buildBlocklist({
      id: 'bl-1',
      sirens: { android: [facebookAndroidSiren] },
    })
    const blocklist2 = buildBlocklist({
      id: 'bl-2',
      sirens: { android: [facebookAndroidSiren, instagramAndroidSiren] },
    })
    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: [blocklist1.id, blocklist2.id],
    })
    const state = stateBuilder()
      .withBlockSessions([session])
      .withBlocklists([blocklist1, blocklist2])
      .build()

    const [firstSchedule] = selectBlockingSchedule(dateProvider, state)
    const androidSirens = firstSchedule.sirens.android
    expect(androidSirens).toHaveLength(2)
    expect(androidSirens).toContainEqual(facebookAndroidSiren)
    expect(androidSirens).toContainEqual(instagramAndroidSiren)
  })

  test('should return scheduled (future) sessions for native layer to handle time checks', () => {
    dateProvider.now.setHours(8, 0, 0, 0)
    const blocklist = buildBlocklist({
      id: 'bl-1',
      sirens: { android: [facebookAndroidSiren] },
    })
    const futureSession = buildBlockSession({
      id: 'future-session',
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: [blocklist.id],
    })
    const state = stateBuilder()
      .withBlockSessions([futureSession])
      .withBlocklists([blocklist])
      .build()

    const schedule = selectBlockingSchedule(dateProvider, state)

    const [firstSchedule] = schedule
    const scheduleId = firstSchedule.id
    expect(schedule).toHaveLength(1)
    expect(scheduleId).toBe('future-session')
  })

  test('should return empty array when no sessions exist', () => {
    const state = stateBuilder().build()

    const schedule = selectBlockingSchedule(dateProvider, state)

    expect(schedule).toHaveLength(0)
  })

  test('should use current blocklist state', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const currentBlocklist = buildBlocklist({
      id: 'bl-1',
      sirens: { android: [tikTokAndroidSiren] },
    })
    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: ['bl-1'],
    })
    const state = stateBuilder()
      .withBlockSessions([session])
      .withBlocklists([currentBlocklist])
      .build()

    const [firstSchedule] = selectBlockingSchedule(dateProvider, state)
    const androidSirens = firstSchedule.sirens.android
    expect(androidSirens).toContainEqual(tikTokAndroidSiren)
  })

  test('should skip deleted blocklists', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: ['bl-deleted'],
    })
    const state = stateBuilder()
      .withBlockSessions([session])
      .withBlocklists([])
      .build()

    const [firstSchedule] = selectBlockingSchedule(dateProvider, state)
    const androidSirens = firstSchedule.sirens.android
    expect(androidSirens).toHaveLength(0)
  })
})
