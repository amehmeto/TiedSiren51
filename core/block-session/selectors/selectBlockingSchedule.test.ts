import { beforeEach, describe, expect, test } from 'vitest'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
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

  test('should return empty array when no sessions exist', () => {
    const state = stateBuilder().build()

    const schedule = selectBlockingSchedule(dateProvider, state)

    expect(schedule).toHaveLength(0)
  })

  test('should return all sessions as blocking schedule', () => {
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
    const futureSession = buildBlockSession({
      id: 'future-session',
      startedAt: '14:00',
      endedAt: '16:00',
      blocklistIds: [blocklist.id],
    })
    const state = stateBuilder()
      .withBlockSessions([activeSession, futureSession])
      .withBlocklists([blocklist])
      .build()

    const schedule = selectBlockingSchedule(dateProvider, state)
    const scheduleIds = schedule.map((s) => s.id)

    expect(schedule).toHaveLength(2)
    expect(scheduleIds).toContain('active-session')
    expect(scheduleIds).toContain('future-session')
  })

  test('should include sirens from blocklists', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const blocklist = buildBlocklist({
      id: 'bl-1',
      sirens: { android: [facebookAndroidSiren, instagramAndroidSiren] },
    })
    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: [blocklist.id],
    })
    const state = stateBuilder()
      .withBlockSessions([session])
      .withBlocklists([blocklist])
      .build()

    const [firstSchedule] = selectBlockingSchedule(dateProvider, state)
    const androidSirens = firstSchedule.sirens.android

    expect(androidSirens).toHaveLength(2)
    expect(androidSirens).toContainEqual(facebookAndroidSiren)
    expect(androidSirens).toContainEqual(instagramAndroidSiren)
  })

  test('should return empty sirens when blocklist was deleted', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: ['deleted-blocklist-id'],
    })
    const state = stateBuilder().withBlockSessions([session]).build()

    const [firstSchedule] = selectBlockingSchedule(dateProvider, state)
    const androidSirens = firstSchedule.sirens.android
    const websites = firstSchedule.sirens.websites
    const keywords = firstSchedule.sirens.keywords

    expect(androidSirens).toHaveLength(0)
    expect(websites).toHaveLength(0)
    expect(keywords).toHaveLength(0)
  })
})
