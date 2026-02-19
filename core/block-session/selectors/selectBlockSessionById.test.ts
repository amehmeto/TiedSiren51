import { describe, expect, test } from 'vitest'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectBlockSessionById } from './selectBlockSessionById'

describe('selectBlockSessionById', () => {
  test('should return block session when it exists', () => {
    const session = buildBlockSession({ id: 'session-1', name: 'Test Session' })
    const state = stateBuilder().withBlockSessions([session]).build()

    const selectedSession = selectBlockSessionById(state, 'session-1')

    expect(selectedSession).toBeDefined()
    expect(selectedSession?.id).toBe('session-1')
    expect(selectedSession?.name).toBe('Test Session')
  })

  test('should return undefined when session does not exist', () => {
    const state = stateBuilder().build()

    const selectedSession = selectBlockSessionById(state, 'non-existent')

    expect(selectedSession).toBeUndefined()
  })
})
