import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'

export class FakeAuthGateway implements AuthGateway {
  willResult: AuthUser | Error = {
    id: 'fake-user-id',
    email: 'fake-user@gmail.com',
  }

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  private resolveResult(): Promise<AuthUser> {
    if (this.willResult instanceof Error) {
      return Promise.reject(this.willResult)
    }
    return Promise.resolve(this.willResult)
  }

  signInWithGoogle(): Promise<AuthUser> {
    return this.resolveResult()
  }

  signInWithApple(): Promise<AuthUser> {
    return this.resolveResult()
  }

  signUpWithEmail(email: string, password: string): Promise<AuthUser> {
    return this.resolveResult()
  }

  signInWithEmail(email: string, password: string): Promise<AuthUser> {
    return this.resolveResult()
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
