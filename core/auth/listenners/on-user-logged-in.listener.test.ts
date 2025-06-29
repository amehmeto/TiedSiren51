import { describe, expect, it } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { userAuthenticated } from '@/core/auth/reducer'

describe('onUserLoggedIn listener', () => {
  it('should dispatch a user status changed action when the auth gateway notifies the user is authenticated', async () => {
    const authGateway = new FakeAuthGateway()
    const store = createTestStore({
      authGateway,
    })

    authGateway.simulateUserLoggedIn({
      id: 'wesh alors',
      email: 'jul@gmail.com',
      username: 'Jul',
    })
    const dispatchedActions = store.getActions()

    expect(dispatchedActions).toContainEqual(
      userAuthenticated({
        id: 'wesh alors',
        email: 'jul@gmail.com',
        username: 'Jul',
      }),
    )

    expect(
      dispatchedActions.some(
        (action) => action.type === 'auth/loadUser/pending',
      ),
    ).toBe(true)

    expect(
      dispatchedActions.some(
        (action) => action.type === 'siren/tieSirens /pending',
      ),
    ).toBe(true)
  })
})
