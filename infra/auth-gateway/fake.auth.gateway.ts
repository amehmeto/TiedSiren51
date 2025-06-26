import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'

export class FakeAuthGateway implements AuthGateway {
  willSucceedForUser: AuthUser = {
    id: 'fake-user-id',
    email: 'fake-user@gmail.com',
  }

  private expectedCredentials = {
    email: 'fake-user@gmail.com',
    password: 'fake-123456',
  }

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  setExpectedCredentials(email: string, password: string) {
    this.expectedCredentials = { email, password }
  }

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
    if (
      this.expectedCredentials.email === email &&
      this.expectedCredentials.password === password
    ) {
      return Promise.resolve(this.willSucceedForUser)
    }
    return Promise.reject(new Error('Invalid credentials'))
  }

  signInWithEmail(email: string, password: string): Promise<AuthUser> {
    if (
      this.expectedCredentials.email === email &&
      this.expectedCredentials.password === password
    ) {
      return Promise.resolve(this.willSucceedForUser)
    }
    return Promise.reject(new Error('Invalid credentials'))
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
