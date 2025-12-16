import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { InMemorySirenLookout } from '@/infra/siren-tier/in-memory.siren-lookout'

describe('onSirenDetected listener', () => {
  let sirenLookout: InMemorySirenLookout
  let logger: InMemoryLogger

  beforeEach(() => {
    sirenLookout = new InMemorySirenLookout()
    logger = new InMemoryLogger()
  })

  it('should trigger blockLaunchedApp use case when siren is detected', () => {
    const store = createTestStore({ sirenLookout })

    sirenLookout.simulateDetection('com.facebook.katana')

    const dispatchedActions = store.getActions()
    const hasBlockLaunchedAppPending = dispatchedActions.some(
      (action) => action.type === 'siren/blockLaunchedApp/pending',
    )

    expect(hasBlockLaunchedAppPending).toBe(true)
  })

  it('should log error when dispatch throws', () => {
    const store = createTestStore({ sirenLookout, logger })
    const expectedLog = {
      level: 'error',
      message: 'Error in onSirenDetected listener: Error: Dispatch failed',
    }
    // eslint-disable-next-line no-restricted-properties -- store.dispatch can't be injected
    vi.spyOn(store, 'dispatch').mockImplementation(() => {
      throw new Error('Dispatch failed')
    })

    sirenLookout.simulateDetection('com.test.app')

    const logs = logger.getLogs()
    expect(logs).toContainEqual(expectedLog)
  })
})
