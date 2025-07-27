import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'

export class FakeAuthGateway implements AuthGateway {
  willResultWith: Promise<AuthUser> = Promise.resolve({
    id: 'fake-user-id',
    email: 'fake-user@gmail.com',
  })

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  signInWithGoogle(): Promise<AuthUser> {
    return this.willResultWith
  }

  signInWithApple(): Promise<AuthUser> {
    return this.willResultWith
  }

  signUpWithEmail(email: string, password: string): Promise<AuthUser> {
    return this.willResultWith
  }

  signInWithEmail(email: string, password: string): Promise<AuthUser> {
    return this.willResultWith
  }

  onUserLoggedIn(listener: (user: AuthUser) => void): void {
    this.onUserLoggedInListener = listener
  }

  onUserLoggedOut(listener: () => void): void {
    this.onUserLoggedOutListener = listener
  }

  async logOut(): Promise<void> {
    if (this.onUserLoggedOutListener) {
      this.onUserLoggedOutListener()
    }
    return Promise.resolve()
  }

  simulateUserLoggedIn(authUser: AuthUser) {
    this.onUserLoggedInListener?.(authUser)
  }

  simulateUserLoggedOut() {
    this.onUserLoggedOutListener?.()
  }
}
