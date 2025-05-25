import { describe, expect, it } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { userAuthenticated } from '@/core/auth/reducer'
import { AuthUser } from '../authUser'

describe('Feature: Listen to user logged out events', () => {
  it('should dispatch userAuthenticated and logOut when user logs out', () => {
    const authGateway = new FakeAuthGateway()
    const store = createTestStore({ authGateway })

    authGateway.simulateUserLoggedOut()
    const dispatchedActions = store.getActions()

    expect(dispatchedActions).toContainEqual(
      userAuthenticated(null as unknown as AuthUser),
    )
    expect(
      dispatchedActions.some((action) => action.type === 'auth/logOut/pending'),
    ).toBe(true)
  })
})
