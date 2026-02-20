import {
  AuthGateway,
  EmailVerificationResult,
} from '@/core/_ports_/auth.gateway'
import { AuthProvider, AuthUser } from '@/core/auth/auth-user'

export class FakeAuthGateway implements AuthGateway {
  willResultWith: Promise<AuthUser> = Promise.resolve({
    id: 'fake-user-id',
    email: 'fake-user@gmail.com',
    isEmailVerified: false,
    authProvider: AuthProvider.Email,
  })

  willReauthenticateWith: Promise<void> = Promise.resolve()

  willReauthenticateWithGoogleWith: Promise<void> = Promise.resolve()

  willDeleteAccountWith: Promise<void> = Promise.resolve()

  willConfirmPasswordResetWith: Promise<void> = Promise.resolve()

  willChangePasswordWith: Promise<void> = Promise.resolve()

  willSendVerificationEmailWith: Promise<void> = Promise.resolve()

  willApplyEmailVerificationCodeWith: Promise<EmailVerificationResult> =
    Promise.resolve(EmailVerificationResult.Verified)

  verificationEmailSentCount = 0

  logOutError: Error | null = null

  lastResetPasswordEmail: string | null = null

  lastConfirmPasswordResetOobCode: string | null = null

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  reauthenticate(_password: string): Promise<void> {
    return this.willReauthenticateWith
  }

  changePassword(_newPassword: string): Promise<void> {
    return this.willChangePasswordWith
  }

  reauthenticateWithGoogle(): Promise<void> {
    return this.willReauthenticateWithGoogleWith
  }

  signInWithGoogle(): Promise<AuthUser> {
    return this.willResultWith
  }

  signInWithApple(): Promise<AuthUser> {
    return this.willResultWith
  }

  signUpWithEmail(_email: string, _password: string): Promise<AuthUser> {
    return this.willResultWith
  }

  signInWithEmail(_email: string, _password: string): Promise<AuthUser> {
    return this.willResultWith
  }

  async resetPassword(email: string): Promise<void> {
    await this.willResultWith
    this.lastResetPasswordEmail = email
  }

  async confirmPasswordReset(
    oobCode: string,
    _newPassword: string,
  ): Promise<void> {
    await this.willConfirmPasswordResetWith
    this.lastConfirmPasswordResetOobCode = oobCode
  }

  async sendVerificationEmail(): Promise<void> {
    await this.willSendVerificationEmailWith
    this.verificationEmailSentCount++
  }

  async applyEmailVerificationCode(
    _oobCode: string,
  ): Promise<EmailVerificationResult> {
    return this.willApplyEmailVerificationCodeWith
  }

  onUserLoggedIn(listener: (user: AuthUser) => void): void {
    this.onUserLoggedInListener = listener
  }

  onUserLoggedOut(listener: () => void): void {
    this.onUserLoggedOutListener = listener
  }

  async deleteAccount(): Promise<void> {
    await this.willDeleteAccountWith
    this.onUserLoggedOutListener?.()
  }

  async logOut(): Promise<void> {
    if (this.logOutError) throw this.logOutError
    if (this.onUserLoggedOutListener) this.onUserLoggedOutListener()
  }

  simulateUserLoggedIn(authUser: AuthUser) {
    this.onUserLoggedInListener?.(authUser)
  }

  simulateUserLoggedOut() {
    this.onUserLoggedOutListener?.()
  }
}
