import { AuthGateway } from '@/core/_ports_/auth.gateway'
import { AuthUser } from '@/core/auth/auth-user'

export class FakeAuthGateway implements AuthGateway {
  willResultWith: Promise<AuthUser> = Promise.resolve({
    id: 'fake-user-id',
    email: 'fake-user@gmail.com',
  })

  willReauthenticateWith: Promise<void> = Promise.resolve()

  lastResetPasswordEmail: string | null = null

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  reauthenticate(_password: string): Promise<void> {
    return this.willReauthenticateWith
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

  onUserLoggedIn(listener: (user: AuthUser) => void): void {
    this.onUserLoggedInListener = listener
  }

  onUserLoggedOut(listener: () => void): void {
    this.onUserLoggedOutListener = listener
  }

  async logOut(): Promise<void> {
    if (this.onUserLoggedOutListener) this.onUserLoggedOutListener()

    return Promise.resolve()
  }

  simulateUserLoggedIn(authUser: AuthUser) {
    this.onUserLoggedInListener?.(authUser)
  }

  simulateUserLoggedOut() {
    this.onUserLoggedOutListener?.()
  }
}
