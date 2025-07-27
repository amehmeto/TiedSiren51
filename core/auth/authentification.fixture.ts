import {
  stateBuilder,
  stateBuilderProvider,
} from '@/core/_tests_/state-builder'
import { AppStore } from '@/core/_redux_/createStore'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { AuthUser } from '@/core/auth/authUser'
import { expect } from 'vitest'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { signUpWithEmail } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { signInWithEmail } from '@/core/auth/usecases/sign-in-with-email.usecase'
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
        authGateway.willResultWith = Promise.resolve(authUser)
      },
      authenticationWithAppleWillSucceedForUser(authUser: AuthUser) {
        authGateway.willResultWith = Promise.resolve(authUser)
      },
      authenticationWithEmailWillSucceedForUser(
        authUser: AuthUser,
        _password: string,
      ) {
        authGateway.willResultWith = Promise.resolve(authUser)
      },
      authenticationWithEmailWillFailForUser(
        _authUser: AuthUser,
        _password: string,
      ) {
        authGateway.willResultWith = Promise.reject(
          new Error('Invalid credentials'),
        )
      },
      authUserIs(authUser: AuthUser) {
        testStateBuilderProvider.setState((stateBuilder) =>
          stateBuilder.withAuthUser(authUser),
        )
      },
    },
    when: {
      async signInWithGoogle() {
        return store.dispatch(signInWithGoogle())
      },
      async signInWithApple() {
        return store.dispatch(signInWithApple())
      },
      signUpWithEmail(email: string, password: string) {
        return store.dispatch(signUpWithEmail({ email, password }))
      },
      signInWithEmail(email: string, password: string) {
        return store.dispatch(signInWithEmail({ email, password }))
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
