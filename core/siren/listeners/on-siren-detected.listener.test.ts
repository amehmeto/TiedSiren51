import { beforeEach, describe, expect, it } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { InMemorySirenLookout } from '@/infra/siren-tier/in-memory.siren-lookout'

describe('onSirenDetected listener', () => {
  let sirenLookout: InMemorySirenLookout

  beforeEach(() => {
    sirenLookout = new InMemorySirenLookout()
  })

  it('should trigger blockLaunchedApp use case when siren is detected', () => {
    const store = createTestStore({
      sirenLookout,
    })

    sirenLookout.simulateDetection('com.facebook.katana')

    const dispatchedActions = store.getActions()

    const hasBlockLaunchedAppPending = dispatchedActions.some(
      (action) => action.type === 'siren/blockLaunchedApp/pending',
    )

    expect(hasBlockLaunchedAppPending).toBe(true)
  })
})
