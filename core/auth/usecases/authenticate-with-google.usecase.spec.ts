import { beforeEach, describe, expect, it } from 'vitest'
import {
  stateBuilder,
  stateBuilderProvider,
} from '@/core/_tests_/state-builder'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { authenticateWithGoogle } from '@/core/auth/usecases/authenticate-with-google.usecase'
import { AuthUser } from '@/core/auth/authUser'
import { AppStore } from '@/core/_redux_/createStore'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'

export function authentificationFixture(
  testStateBuilderProvider = stateBuilderProvider(),
) {
  let store: AppStore
  const authGateway = new FakeAuthGateway()
  store = createTestStore({ authGateway })
  return {
    given: {
      authenticationWithGoogleWillSucceedForUser(authUser: AuthUser) {
        authGateway.willSucceedForUser = authUser
      },
    },

    when: {
      async authenticateWithGoogle() {
        return store.dispatch(authenticateWithGoogle())
      },
    },
    then: {
      userShouldBeAuthenticated(authUser: AuthUser) {
        const expectedState = stateBuilder().withAuthUser(authUser).build()
        expect(store.getState()).toEqual(expectedState)
      },
    },
  }
}

describe('Feature: Authenticate with Google', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })
  it('should authenticate with Google successfully', async () => {
    fixture.given.authenticationWithGoogleWillSucceedForUser({
      id: 'auth-user-id',
      username: 'Elon',
    })

    await fixture.when.authenticateWithGoogle()

    fixture.then.userShouldBeAuthenticated({
      id: 'auth-user-id',
      username: 'Elon',
    })
  })
})
