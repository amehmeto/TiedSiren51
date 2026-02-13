import { expect } from 'vitest'
import { ISODateString } from '@/core/_ports_/date-provider'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { Fixture } from '@/core/_tests_/fixture.type'
import {
  stateBuilder,
  stateBuilderProvider,
} from '@/core/_tests_/state-builder'
import { AuthUser } from '@/core/auth/auth-user'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { reauthenticate } from '@/core/auth/usecases/reauthenticate.usecase'
import { resetPassword } from '@/core/auth/usecases/reset-password.usecase'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signInWithEmail } from '@/core/auth/usecases/sign-in-with-email.usecase'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { signUpWithEmail } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'

export function authentificationFixture(
  testStateBuilderProvider = stateBuilderProvider(),
): Fixture {
  let store: AppStore
  const authGateway = new FakeAuthGateway()
  const dateProvider = new StubDateProvider()
  store = createTestStore({ authGateway, dateProvider })

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
      reauthenticationWillSucceed() {
        authGateway.willReauthenticateWith = Promise.resolve()
      },
      reauthenticationWillFailWith(errorMessage: string) {
        authGateway.willReauthenticateWith = Promise.reject(
          new Error(errorMessage),
        )
      },
      nowIs(isoDate: ISODateString) {
        dateProvider.now = new Date(isoDate)
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
          { authGateway, dateProvider },
          testStateBuilderProvider.getState(),
        )
        return store.dispatch(logOut())
      },
      resetPasswordFor(email: string) {
        return store.dispatch(resetPassword({ email }))
      },
      reauthenticate(password: string) {
        return store.dispatch(reauthenticate({ password }))
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
      authShouldBeLoading(isLoading: boolean) {
        const state = store.getState()
        expect(state.auth.isLoading).toBe(isLoading)
      },
      authShouldNotBeLoading() {
        const state = store.getState()
        expect(state.auth.isLoading).toBe(false)
      },
      passwordResetShouldBeSentTo(expectedEmail: string) {
        expect(authGateway.lastResetPasswordEmail).toBe(expectedEmail)
      },
      passwordResetShouldNotBeSent() {
        expect(authGateway.lastResetPasswordEmail).toBeNull()
      },
      lastReauthenticatedAtShouldBe(expected: ISODateString | null) {
        const state = store.getState()
        expect(state.auth.lastReauthenticatedAt).toBe(expected)
      },
      reauthShouldNotBeLoading() {
        const state = store.getState()
        expect(state.auth.isReauthenticating).toBe(false)
      },
      reauthErrorShouldBe(expected: string) {
        const state = store.getState()
        expect(state.auth.reauthError).toBe(expected)
      },
      reauthErrorShouldBeNull() {
        const state = store.getState()
        expect(state.auth.reauthError).toBeNull()
      },
    },
  }
}
