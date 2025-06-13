import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'

export class FakeAuthGateway implements AuthGateway {
  willSucceedForUser: AuthUser = {
    id: 'fake-user-id',
    email: 'fake-user@gmail.com',
  }

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  signInWithGoogle(): Promise<AuthUser> {
    return Promise.resolve(this.willSucceedForUser)
  }

  onUserLoggedIn(listener: (user: AuthUser) => void): void {
    this.onUserLoggedInListener = listener
  }

  onUserLoggedOut(listener: () => void): void {
    this.onUserLoggedOutListener = listener
  }

  signInWithApple(): Promise<AuthUser> {
    return Promise.resolve(this.willSucceedForUser)
  }

  signUpWithEmail(email: string, password: string): Promise<AuthUser> {
    return Promise.resolve(this.willSucceedForUser)
  }

  signInWithEmail(email: string, password: string): Promise<AuthUser> {
    return Promise.resolve(this.willSucceedForUser)
  }

  simulateUserLoggedIn(authUser: AuthUser) {
    if (!this.onUserLoggedInListener) return
    this.onUserLoggedInListener(authUser)
  }

  async logOut(): Promise<void> {
    if (this.onUserLoggedOutListener) {
      this.onUserLoggedOutListener()
    }
    return Promise.resolve()
  }

  simulateUserLoggedOut() {
    if (!this.onUserLoggedOutListener) return
    this.onUserLoggedOutListener()
  }
}
