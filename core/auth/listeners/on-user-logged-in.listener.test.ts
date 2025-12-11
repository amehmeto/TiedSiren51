import { beforeEach, describe, expect, it } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { userAuthenticated } from '@/core/auth/reducer'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'

describe('onUserLoggedIn listener', () => {
  let authGateway: FakeAuthGateway

  beforeEach(() => {
    authGateway = new FakeAuthGateway()
  })

  it('should dispatch a user status changed action when the auth gateway notifies the user is authenticated', async () => {
    const store = createTestStore({
      authGateway,
    })

    const userPayload = {
      id: 'wesh alors',
      email: 'jul@gmail.com',
      username: 'Jul',
    }
    const expectedAction = userAuthenticated(userPayload)

    authGateway.simulateUserLoggedIn(userPayload)
    const dispatchedActions = store.getActions()

    expect(dispatchedActions).toContainEqual(expectedAction)

    const hasLoadUserPending = dispatchedActions.some(
      (action) => action.type === 'auth/loadUser/pending',
    )

    expect(hasLoadUserPending).toBe(true)

    const hasTargetSirensPending = dispatchedActions.some(
      (action) => action.type === 'siren/targetSirens/pending',
    )

    expect(hasTargetSirensPending).toBe(true)
  })
})
