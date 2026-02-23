import { expect } from 'vitest'
import { EmailVerificationResult } from '@/core/_ports_/auth.gateway'
import { ISODateString } from '@/core/_ports_/date-provider'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { Fixture } from '@/core/_tests_/fixture.type'
import {
  stateBuilder,
  stateBuilderProvider,
} from '@/core/_tests_/state-builder'
import { AuthError } from '@/core/auth/auth-error'
import { AuthErrorType } from '@/core/auth/auth-error-type'
import { AuthUser } from '@/core/auth/auth-user'
import { applyEmailVerificationCode } from '@/core/auth/usecases/apply-email-verification-code.usecase'
import { changePassword } from '@/core/auth/usecases/change-password.usecase'
import { confirmPasswordReset } from '@/core/auth/usecases/confirm-password-reset.usecase'
import { deleteAccount } from '@/core/auth/usecases/delete-account.usecase'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { reauthenticateWithGoogle } from '@/core/auth/usecases/reauthenticate-with-google.usecase'
import { reauthenticate } from '@/core/auth/usecases/reauthenticate.usecase'
import { resetPassword } from '@/core/auth/usecases/reset-password.usecase'
import { sendVerificationEmail } from '@/core/auth/usecases/send-verification-email.usecase'
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
        const error = new AuthError(
          'Invalid credentials',
          AuthErrorType.Credential,
        )
        authGateway.willResultWith = Promise.reject(error)
      },
      authUserIs(authUser: AuthUser) {
        testStateBuilderProvider.setState((stateBuilder) =>
          stateBuilder.withAuthUser(authUser),
        )
      },
      authGatewayWillRejectWith(
        errorMessage: string,
        errorType: AuthErrorType = AuthErrorType.Unknown,
      ) {
        const error = new AuthError(errorMessage, errorType)
        authGateway.willResultWith = Promise.reject(error)
      },
      logOutWillRejectWith(
        errorMessage: string,
        errorType: AuthErrorType = AuthErrorType.Unknown,
      ) {
        authGateway.logOutError = new AuthError(errorMessage, errorType)
      },
      reauthenticationWillSucceed() {
        authGateway.willReauthenticateWith = Promise.resolve()
      },
      reauthenticationWillFailWith(errorMessage: string) {
        const error = new Error(errorMessage)
        authGateway.willReauthenticateWith = Promise.reject(error)
      },
      googleReauthenticationWillSucceed() {
        authGateway.willReauthenticateWithGoogleWith = Promise.resolve()
      },
      googleReauthenticationWillFailWith(errorMessage: string) {
        const error = new Error(errorMessage)
        authGateway.willReauthenticateWithGoogleWith = Promise.reject(error)
      },
      confirmPasswordResetWillFailWith(errorMessage: string) {
        const error = new Error(errorMessage)
        authGateway.willConfirmPasswordResetWith = Promise.reject(error)
      },
      accountDeletionWillSucceed() {
        authGateway.willDeleteAccountWith = Promise.resolve()
      },
      accountDeletionWillFailWith(errorMessage: string) {
        const error = new Error(errorMessage)
        authGateway.willDeleteAccountWith = Promise.reject(error)
      },
      changePasswordWillSucceed() {
        authGateway.willChangePasswordWith = Promise.resolve()
      },
      changePasswordWillFailWith(errorMessage: string) {
        const error = new Error(errorMessage)
        authGateway.willChangePasswordWith = Promise.reject(error)
      },
      sendVerificationEmailWillFailWith(errorMessage: string) {
        const error = new Error(errorMessage)
        authGateway.willSendVerificationEmailWith = Promise.reject(error)
      },
      applyEmailVerificationCodeWillFailWith(errorMessage: string) {
        const error = new Error(errorMessage)
        authGateway.willApplyEmailVerificationCodeWith = Promise.reject(error)
      },
      applyEmailVerificationCodeWillReturnAlreadyVerified() {
        authGateway.willApplyEmailVerificationCodeWith = Promise.resolve(
          EmailVerificationResult.AlreadyVerified,
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
      reauthenticateWithGoogle() {
        return store.dispatch(reauthenticateWithGoogle())
      },
      confirmPasswordReset(oobCode: string, newPassword: string) {
        const payload = { oobCode, newPassword }
        return store.dispatch(confirmPasswordReset(payload))
      },
      deleteAccount() {
        store = createTestStore(
          { authGateway, dateProvider },
          testStateBuilderProvider.getState(),
        )
        return store.dispatch(deleteAccount())
      },
      changePassword(newPassword: string) {
        return store.dispatch(changePassword({ newPassword }))
      },
      sendVerificationEmail() {
        return store.dispatch(sendVerificationEmail())
      },
      applyEmailVerificationCode(oobCode: string) {
        return store.dispatch(applyEmailVerificationCode(oobCode))
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
      authErrorTypeShouldBe(expected: AuthErrorType) {
        const state = store.getState()
        expect(state.auth.errorType).toBe(expected)
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
      lastPasswordResetRequestAtShouldBe(expected: ISODateString) {
        const { lastPasswordResetRequestAt } = store.getState().auth
        expect(lastPasswordResetRequestAt).toBe(expected)
      },
      passwordShouldBeCleared() {
        expect(store.getState().auth.password).toBe('')
      },
      verificationEmailShouldBeSent() {
        expect(authGateway.verificationEmailSentCount).toBeGreaterThan(0)
      },
      emailShouldBeVerified() {
        const { authUser } = store.getState().auth
        expect(authUser?.isEmailVerified).toBe(true)
      },
      emailShouldNotBeVerified() {
        const { authUser } = store.getState().auth
        expect(authUser?.isEmailVerified ?? false).toBe(false)
      },
      toastShouldShow(expectedMessage: string) {
        const { message } = store.getState().toast
        expect(message).toBe(expectedMessage)
      },
      lastReauthenticatedAtShouldBe(expectedDate: ISODateString | null) {
        const { lastReauthenticatedAt } = store.getState().auth
        expect(lastReauthenticatedAt).toBe(expectedDate)
      },
      reauthShouldNotBeLoading() {
        const { isReauthenticating } = store.getState().auth
        expect(isReauthenticating).toBe(false)
      },
      reauthErrorShouldBe(errorMessage: string) {
        const { reauthError } = store.getState().auth
        expect(reauthError).toBe(errorMessage)
      },
      reauthErrorShouldBeNull() {
        const { reauthError } = store.getState().auth
        expect(reauthError).toBeNull()
      },
      authUserShouldBe(expectedUser: AuthUser) {
        const { authUser } = store.getState().auth
        expect(authUser).toEqual(expectedUser)
      },
      passwordResetShouldBeConfirmed() {
        const { isPasswordResetConfirmed } = store.getState().auth
        expect(isPasswordResetConfirmed).toBe(true)
      },
      confirmPasswordResetShouldNotBeLoading() {
        const { isConfirmingPasswordReset } = store.getState().auth
        expect(isConfirmingPasswordReset).toBe(false)
      },
      confirmPasswordResetErrorShouldBe(errorMessage: string) {
        const { confirmPasswordResetError } = store.getState().auth
        expect(confirmPasswordResetError).toBe(errorMessage)
      },
      accountDeletionShouldNotBeLoading() {
        const { isDeletingAccount } = store.getState().auth
        expect(isDeletingAccount).toBe(false)
      },
      deleteAccountErrorShouldBe(errorMessage: string) {
        const { deleteAccountError } = store.getState().auth
        expect(deleteAccountError).toBe(errorMessage)
      },
      changePasswordShouldNotBeLoading() {
        const { isChangingPassword } = store.getState().auth
        expect(isChangingPassword).toBe(false)
      },
      changePasswordErrorShouldBe(errorMessage: string) {
        const { changePasswordError } = store.getState().auth
        expect(changePasswordError).toBe(errorMessage)
      },
      changePasswordErrorShouldBeNull() {
        const { changePasswordError } = store.getState().auth
        expect(changePasswordError).toBeNull()
      },
      changePasswordShouldHaveSucceeded() {
        const { hasChangePasswordSucceeded } = store.getState().auth
        expect(hasChangePasswordSucceeded).toBe(true)
      },
      changePasswordShouldNotHaveSucceeded() {
        const { hasChangePasswordSucceeded } = store.getState().auth
        expect(hasChangePasswordSucceeded).toBe(false)
      },
    },
  }
}
