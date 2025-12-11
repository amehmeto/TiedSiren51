import { beforeEach, describe, expect, it } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { setBlockSessions } from '@/core/block-session/block-session.slice'
import { FakeSirenLookout } from '@/infra/siren-tier/fake.siren-lookout'

describe('onBlockSessionsChanged listener', () => {
  const blockSession = buildBlockSession()
  let sirenLookout: FakeSirenLookout

  beforeEach(() => {
    sirenLookout = new FakeSirenLookout()
  })

  it('should not be watching when store is created without sessions', () => {
    createTestStore({ sirenLookout })

    expect(sirenLookout.watching).toBe(false)
  })

  it('should start watching when store is created with existing sessions', () => {
    const initialState = stateBuilder()
      .withBlockSessions([blockSession])
      .build()

    createTestStore({ sirenLookout }, initialState)

    expect(sirenLookout.watching).toBe(true)
  })

  it('should start watching when sessions are added to store', () => {
    const store = createTestStore({ sirenLookout })

    expect(sirenLookout.watching).toBe(false)

    store.dispatch(setBlockSessions([blockSession]))

    expect(sirenLookout.watching).toBe(true)
  })

  it('should stop watching when all sessions are removed', () => {
    const initialState = stateBuilder()
      .withBlockSessions([blockSession])
      .build()
    const store = createTestStore({ sirenLookout }, initialState)

    expect(sirenLookout.watching).toBe(true)

    store.dispatch(setBlockSessions([]))

    expect(sirenLookout.watching).toBe(false)
  })

  it('should remain watching when sessions change but still have at least one', () => {
    const initialState = stateBuilder()
      .withBlockSessions([blockSession])
      .build()
    const store = createTestStore({ sirenLookout }, initialState)
    const newSession = buildBlockSession()

    store.dispatch(setBlockSessions([blockSession, newSession]))

    expect(sirenLookout.watching).toBe(true)
  })
})
