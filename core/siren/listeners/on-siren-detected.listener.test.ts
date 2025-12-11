import { describe, expect, it } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { InMemorySirenLookout } from '@/infra/siren-tier/in-memory.siren-lookout'

describe('onSirenDetected listener', () => {
  it('should trigger blockLaunchedApp use case when siren is detected', () => {
    const sirenLookout = new InMemorySirenLookout()
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
