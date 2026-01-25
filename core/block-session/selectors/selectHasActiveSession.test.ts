import { beforeEach, describe, expect, test } from 'vitest'
import { facebookAndroidSiren } from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectHasActiveSession } from './selectHasActiveSession'

describe('selectHasActiveSession', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
  })

  test('should return false when no sessions exist', () => {
    const state = stateBuilder().build()

    const hasActiveSession = selectHasActiveSession(dateProvider, state)

    expect(hasActiveSession).toBe(false)
  })

  test('should return true when a session is active', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const blocklist = buildBlocklist({
      id: 'bl-1',
      sirens: { android: [facebookAndroidSiren] },
    })
    const activeSession = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: [blocklist.id],
    })
    const state = stateBuilder()
      .withBlockSessions([activeSession])
      .withBlocklists([blocklist])
      .build()

    const hasActiveSession = selectHasActiveSession(dateProvider, state)

    expect(hasActiveSession).toBe(true)
  })

  test('should return false when session is scheduled but not active', () => {
    dateProvider.now.setHours(8, 0, 0, 0)
    const blocklist = buildBlocklist({
      id: 'bl-1',
      sirens: { android: [facebookAndroidSiren] },
    })
    const futureSession = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: [blocklist.id],
    })
    const state = stateBuilder()
      .withBlockSessions([futureSession])
      .withBlocklists([blocklist])
      .build()

    const hasActiveSession = selectHasActiveSession(dateProvider, state)

    expect(hasActiveSession).toBe(false)
  })
})
