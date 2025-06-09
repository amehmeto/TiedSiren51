import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'

export class FakeAuthGateway implements AuthGateway {
  willSucceedForUser: AuthUser = {
    id: 'fake-user-id',
    username: 'Fake User',
  }

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  authenticateWithGoogle(): Promise<AuthUser> {
    return Promise.resolve(this.willSucceedForUser)
  }

  onUserLoggedIn(listener: (user: AuthUser) => void): void {
    this.onUserLoggedInListener = listener
  }

  onUserLoggedOut(listener: () => void): void {
    this.onUserLoggedOutListener = listener
  }

  authenticateWithApple(): Promise<AuthUser> {
    return Promise.resolve(this.willSucceedForUser)
  }

  authenticateWithEmail(email: string, password: string): Promise<AuthUser> {
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
