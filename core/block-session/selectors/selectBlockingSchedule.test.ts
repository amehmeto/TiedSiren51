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

  test('should return blocking schedule for active sessions', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const activeSession = buildBlockSession({
      id: 'active-session',
      startedAt: '09:00',
      endedAt: '11:00',
      blocklists: [
        buildBlocklist({ sirens: { android: [facebookAndroidSiren] } }),
      ],
    })
    const state = stateBuilder().withBlockSessions([activeSession]).build()

    const schedule = selectBlockingSchedule(dateProvider, state.blockSession)

    const [firstSchedule] = schedule
    const firstScheduleId = firstSchedule.id
    const androidSirens = firstSchedule.sirens.android
    expect(schedule).toHaveLength(1)
    expect(firstScheduleId).toBe('active-session')
    expect(androidSirens).toContainEqual(facebookAndroidSiren)
  })

  test('should deduplicate apps across blocklists', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklists: [
        buildBlocklist({ sirens: { android: [facebookAndroidSiren] } }),
        buildBlocklist({
          sirens: { android: [facebookAndroidSiren, instagramAndroidSiren] },
        }),
      ],
    })
    const state = stateBuilder().withBlockSessions([session]).build()

    const schedule = selectBlockingSchedule(dateProvider, state.blockSession)

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

    const schedule = selectBlockingSchedule(dateProvider, state.blockSession)

    expect(schedule).toHaveLength(0)
  })

  test('should return empty array when no sessions exist', () => {
    const state = stateBuilder().build()

    const schedule = selectBlockingSchedule(dateProvider, state.blockSession)

    expect(schedule).toHaveLength(0)
  })
})
