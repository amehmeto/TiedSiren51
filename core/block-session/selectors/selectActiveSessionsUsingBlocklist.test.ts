import { beforeEach, describe, expect, test } from 'vitest'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectActiveSessionsUsingBlocklist } from './selectActiveSessionsUsingBlocklist'

describe('selectActiveSessionsUsingBlocklist', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
  })

  test('should return active sessions that use the specified blocklist', () => {
    dateProvider.now.setHours(10, 0, 0, 0)

    const sessionWithTargetBlocklist = buildBlockSession({
      id: 'session-with-target',
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: ['target-blocklist'],
    })
    const sessionWithOtherBlocklist = buildBlockSession({
      id: 'session-with-other',
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: ['other-blocklist'],
    })
    const state = stateBuilder()
      .withBlockSessions([
        sessionWithTargetBlocklist,
        sessionWithOtherBlocklist,
      ])
      .build()

    const sessions = selectActiveSessionsUsingBlocklist(
      dateProvider,
      state.blockSession,
      'target-blocklist',
    )

    const sessionIds = sessions.map((s) => s.id)

    expect(sessions).toHaveLength(1)
    expect(sessionIds).toContain('session-with-target')
  })

  test('should return empty array when no active sessions use the blocklist', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const session = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: ['other-blocklist'],
    })
    const state = stateBuilder().withBlockSessions([session]).build()

    const sessions = selectActiveSessionsUsingBlocklist(
      dateProvider,
      state.blockSession,
      'target-blocklist',
    )

    expect(sessions).toHaveLength(0)
  })

  test('should not return inactive sessions even if they use the blocklist', () => {
    dateProvider.now.setHours(8, 0, 0, 0)
    const inactiveSession = buildBlockSession({
      id: 'inactive-session',
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: ['target-blocklist'],
    })
    const state = stateBuilder().withBlockSessions([inactiveSession]).build()

    const sessions = selectActiveSessionsUsingBlocklist(
      dateProvider,
      state.blockSession,
      'target-blocklist',
    )

    expect(sessions).toHaveLength(0)
  })

  test('should return session when blocklist is one of many in the session', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const session = buildBlockSession({
      id: 'session-with-multiple',
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: ['other-blocklist', 'target-blocklist'],
    })
    const state = stateBuilder().withBlockSessions([session]).build()

    const sessions = selectActiveSessionsUsingBlocklist(
      dateProvider,
      state.blockSession,
      'target-blocklist',
    )

    const sessionIds = sessions.map((s) => s.id)

    expect(sessions).toHaveLength(1)
    expect(sessionIds).toContain('session-with-multiple')
  })
})
