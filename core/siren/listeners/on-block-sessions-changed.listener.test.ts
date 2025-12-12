import { beforeEach, describe, expect, it } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { setBlockSessions } from '@/core/block-session/block-session.slice'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { InMemorySirenLookout } from '@/infra/siren-tier/in-memory.siren-lookout'

describe('onBlockSessionsChanged listener', () => {
  const blockSession = buildBlockSession()
  let sirenLookout: InMemorySirenLookout
  let logger: InMemoryLogger

  beforeEach(() => {
    sirenLookout = new InMemorySirenLookout()
    logger = new InMemoryLogger()
  })

  it('should not be watching when store is created without sessions', () => {
    createTestStore({ sirenLookout })

    expect(sirenLookout.isWatching).toBe(false)
  })

  it('should start watching when store is created with existing sessions', () => {
    const initialState = stateBuilder()
      .withBlockSessions([blockSession])
      .build()

    createTestStore({ sirenLookout }, initialState)

    expect(sirenLookout.isWatching).toBe(true)
  })

  it('should start watching when sessions are added to store', () => {
    const store = createTestStore({ sirenLookout })

    expect(sirenLookout.isWatching).toBe(false)

    store.dispatch(setBlockSessions([blockSession]))

    expect(sirenLookout.isWatching).toBe(true)
  })

  it('should stop watching when all sessions are removed', () => {
    const initialState = stateBuilder()
      .withBlockSessions([blockSession])
      .build()
    const store = createTestStore({ sirenLookout }, initialState)

    expect(sirenLookout.isWatching).toBe(true)

    store.dispatch(setBlockSessions([]))

    expect(sirenLookout.isWatching).toBe(false)
  })

  it('should remain watching when sessions change but still have at least one', () => {
    const initialState = stateBuilder()
      .withBlockSessions([blockSession])
      .build()
    const store = createTestStore({ sirenLookout }, initialState)
    const newSession = buildBlockSession()

    store.dispatch(setBlockSessions([blockSession, newSession]))

    expect(sirenLookout.isWatching).toBe(true)
  })

  it('should log error when startWatching throws', () => {
    sirenLookout.shouldThrowOnStart = true
    const initialState = stateBuilder()
      .withBlockSessions([blockSession])
      .build()
    const expectedLog = {
      level: 'error',
      message: 'Failed to start watching: Error: Start watching failed',
    }

    createTestStore({ sirenLookout, logger }, initialState)

    const logs = logger.getLogs()
    expect(logs).toContainEqual(expectedLog)
  })

  it('should log error when stopWatching throws', () => {
    sirenLookout.shouldThrowOnStop = true
    const initialState = stateBuilder()
      .withBlockSessions([blockSession])
      .build()
    const store = createTestStore({ sirenLookout, logger }, initialState)
    const expectedLog = {
      level: 'error',
      message: 'Failed to stop watching: Error: Stop watching failed',
    }

    store.dispatch(setBlockSessions([]))

    const logs = logger.getLogs()
    expect(logs).toContainEqual(expectedLog)
  })
})
