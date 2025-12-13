import { beforeEach, describe, expect, test } from 'vitest'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectActiveSessions } from './selectActiveSessions'

describe('selectActiveSessions', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
  })

  test('should return sessions that are currently active', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const activeSession = buildBlockSession({
      id: 'active-session',
      startedAt: '09:00',
      endedAt: '11:00',
    })
    const inactiveSession = buildBlockSession({
      id: 'inactive-session',
      startedAt: '12:00',
      endedAt: '14:00',
    })
    const state = stateBuilder()
      .withBlockSessions([activeSession, inactiveSession])
      .build()

    const activeSessions = selectActiveSessions(
      dateProvider,
      state.blockSession,
    )

    const ids = activeSessions.map((s) => s.id)
    expect(activeSessions).toHaveLength(1)
    expect(ids).toContain('active-session')
  })

  test('should return empty array when no sessions are active', () => {
    dateProvider.now.setHours(8, 0, 0, 0)
    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
    })
    const state = stateBuilder().withBlockSessions([session]).build()

    const activeSessions = selectActiveSessions(
      dateProvider,
      state.blockSession,
    )

    expect(activeSessions).toHaveLength(0)
  })

  test('should return empty array when no sessions exist', () => {
    const state = stateBuilder().build()

    const activeSessions = selectActiveSessions(
      dateProvider,
      state.blockSession,
    )

    expect(activeSessions).toHaveLength(0)
  })
})
