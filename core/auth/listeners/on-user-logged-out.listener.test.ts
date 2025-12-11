import { beforeEach, describe, expect, it } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'

describe('Feature: Listen to user logged out events', () => {
  let authGateway: FakeAuthGateway

  beforeEach(() => {
    authGateway = new FakeAuthGateway()
  })

  it('should dispatch userAuthenticated and logOut when user logs out', () => {
    const store = createTestStore({ authGateway })

    authGateway.simulateUserLoggedOut()
    const dispatchedActions = store.getActions()

    const hasLogOutPending = dispatchedActions.some(
      (action) => action.type === 'auth/logOut/pending',
    )

    expect(hasLogOutPending).toBe(true)
  })
})
