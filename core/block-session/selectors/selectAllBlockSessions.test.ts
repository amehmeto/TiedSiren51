import { describe, expect, test } from 'vitest'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectAllBlockSessions } from './selectAllBlockSessions'

describe('selectAllBlockSessions', () => {
  test('should return all block sessions', () => {
    const session1 = buildBlockSession({ id: 'session-1' })
    const session2 = buildBlockSession({ id: 'session-2' })
    const state = stateBuilder().withBlockSessions([session1, session2]).build()

    const sessions = selectAllBlockSessions(state.blockSession)

    const ids = sessions.map((s) => s.id)
    expect(sessions).toHaveLength(2)
    expect(ids).toContain('session-1')
    expect(ids).toContain('session-2')
  })

  test('should return empty array when no sessions exist', () => {
    const state = stateBuilder().build()

    const sessions = selectAllBlockSessions(state.blockSession)

    expect(sessions).toHaveLength(0)
  })
})
