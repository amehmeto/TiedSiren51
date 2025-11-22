import { expect } from 'vitest'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { Fixture } from '@/core/_tests_/fixture.types'
import {
  stateBuilder,
  stateBuilderProvider,
} from '@/core/_tests_/state-builder'
import { AuthUser } from '@/core/auth/authUser'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signInWithEmail } from '@/core/auth/usecases/sign-in-with-email.usecase'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { signUpWithEmail } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'

export function authentificationFixture(
  testStateBuilderProvider = stateBuilderProvider(),
): Fixture {
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
      authGatewayWillRejectWith(errorMessage: string) {
        authGateway.willResultWith = Promise.reject(new Error(errorMessage))
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
      authenticationErrorsShouldBe(expectedError: string) {
        const state = store.getState()
        expect(state.auth.error).toBe(expectedError)
      },
      shouldBeLoading(loading: boolean) {
        const state = store.getState()
        expect(state.auth.isLoading).toBe(loading)
      },
      shouldNotBeLoading() {
        const state = store.getState()
        expect(state.auth.isLoading).toBe(false)
      },
    },
  }
}
