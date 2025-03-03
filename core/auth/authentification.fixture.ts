import {
  stateBuilder,
  stateBuilderProvider,
} from '@/core/_tests_/state-builder'
import { AppStore } from '@/core/_redux_/createStore'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { AuthUser } from '@/core/auth/authUser'
import { authenticateWithGoogle } from '@/core/auth/usecases/authenticate-with-google.usecase'
import { expect } from 'vitest'
import { authenticateWithApple } from '@/core/auth/usecases/authenticate-with-apple.usecase'
import { authenticateWithEmail } from '@/core/auth/usecases/authenticate-with-email.usecase'
import { logOut } from '@/core/auth/usecases/log-out.usecase'

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
      authenticationWithAppleWillSucceedForUser(authUser: AuthUser) {
        authGateway.willSucceedForUser = authUser
      },
      authenticationWithEmailWillSucceedForUser(authUser: AuthUser) {
        authGateway.willSucceedForUser = authUser
      },
      authUserIs(authUser: AuthUser) {
        testStateBuilderProvider.setState((stateBuilder) =>
          stateBuilder.withAuthUser(authUser),
        )
      },
    },
    when: {
      async authenticateWithGoogle() {
        return store.dispatch(authenticateWithGoogle())
      },
      async authenticateWithApple() {
        return store.dispatch(authenticateWithApple())
      },
      authenticateWithEmail(email: string, password: string) {
        return store.dispatch(authenticateWithEmail({ email, password }))
      },
      logOut() {
        store = createTestStore(
          { authGateway },
          testStateBuilderProvider.getState(),
        )
        return store.dispatch(logOut())
      },
    },
    then: {
      userShouldBeAuthenticated(authUser: AuthUser) {
        const expectedState = stateBuilder().withAuthUser(authUser).build()
        expect(store.getState()).toEqual(expectedState)
      },
      userShouldNotBeAuthenticated() {
        const expectedState = stateBuilder().withoutAuthUser({}).build()
        expect(store.getState()).toEqual(expectedState)
      },
    },
  }
}
