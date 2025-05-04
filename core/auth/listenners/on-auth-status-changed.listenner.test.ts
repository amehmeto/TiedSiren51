import { describe, it, expect } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { userAuthenticated } from '@/core/auth/reducer'

describe('onAuthStatusChanged listenner', () => {
  it('should dispatch a user status changed action when the auth gateway notifies the user is authenticated', async () => {
    const authGateway = new FakeAuthGateway()
    const store = createTestStore({
      authGateway,
    })
    const expectedDispatchedAuthAction = userAuthenticated({
      id: 'wesh alors',
      username: 'Jul',
    })

    authGateway.simulateAuthStatusChanged({
      id: 'wesh alors',
      username: 'Jul',
    })
    const dispatchedActions = store.getActions()

    expect(dispatchedActions).toContainEqual(expectedDispatchedAuthAction)
  })
})
