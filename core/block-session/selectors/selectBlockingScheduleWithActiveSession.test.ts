import { beforeEach, describe, expect, test } from 'vitest'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectBlockingScheduleWithActiveSession } from './selectBlockingScheduleWithActiveSession'

describe('selectBlockingScheduleWithActiveSession', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
  })

  test('should return schedule with all sessions and hasActiveSession=true when session is active', () => {
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

    const result = selectBlockingScheduleWithActiveSession(dateProvider, state)

    expect(result.schedule).toHaveLength(1)
    expect(result.hasActiveSession).toBe(true)
  })

  test('should return schedule with future sessions and hasActiveSession=false when no session is active', () => {
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

    const result = selectBlockingScheduleWithActiveSession(dateProvider, state)

    expect(result.schedule).toHaveLength(1)
    expect(result.hasActiveSession).toBe(false)
  })

  test('should return empty schedule and hasActiveSession=false when no sessions exist', () => {
    const state = stateBuilder().build()

    const result = selectBlockingScheduleWithActiveSession(dateProvider, state)

    expect(result.schedule).toHaveLength(0)
    expect(result.hasActiveSession).toBe(false)
  })

  test('should include both active and scheduled sessions in schedule', () => {
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

    const result = selectBlockingScheduleWithActiveSession(dateProvider, state)

    const scheduleIds = result.schedule.map((s) => s.id)
    expect(result.schedule).toHaveLength(2)
    expect(scheduleIds).toContain('active-session')
    expect(scheduleIds).toContain('future-session')
    expect(result.hasActiveSession).toBe(true)
  })

  test('should reflect current blocklist sirens in schedule', () => {
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

    const result = selectBlockingScheduleWithActiveSession(dateProvider, state)

    const [firstSchedule] = result.schedule
    const androidSirens = firstSchedule.sirens.android
    expect(androidSirens).toHaveLength(2)
    expect(androidSirens).toContainEqual(facebookAndroidSiren)
    expect(androidSirens).toContainEqual(instagramAndroidSiren)
  })
})
