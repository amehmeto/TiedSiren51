import { beforeEach, describe, expect, test } from 'vitest'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectScheduledSessions } from './selectScheduledSessions'

describe('selectScheduledSessions', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
  })

  test('should return sessions that are not currently active', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const activeSession = buildBlockSession({
      id: 'active-session',
      startedAt: '09:00',
      endedAt: '11:00',
    })
    const scheduledSession = buildBlockSession({
      id: 'scheduled-session',
      startedAt: '12:00',
      endedAt: '14:00',
    })
    const state = stateBuilder()
      .withBlockSessions([activeSession, scheduledSession])
      .build()

    const scheduled = selectScheduledSessions(state, dateProvider)

    const ids = scheduled.map((s) => s.id)
    expect(scheduled).toHaveLength(1)
    expect(ids).toContain('scheduled-session')
  })

  test('should return all sessions when none are active', () => {
    dateProvider.now.setHours(8, 0, 0, 0)
    const session1 = buildBlockSession({
      id: 'session-1',
      startedAt: '09:00',
      endedAt: '11:00',
    })
    const session2 = buildBlockSession({
      id: 'session-2',
      startedAt: '12:00',
      endedAt: '14:00',
    })
    const state = stateBuilder().withBlockSessions([session1, session2]).build()

    const scheduled = selectScheduledSessions(state, dateProvider)

    expect(scheduled).toHaveLength(2)
  })

  test('should return empty array when no sessions exist', () => {
    const state = stateBuilder().build()

    const scheduled = selectScheduledSessions(state, dateProvider)

    expect(scheduled).toHaveLength(0)
  })
})
