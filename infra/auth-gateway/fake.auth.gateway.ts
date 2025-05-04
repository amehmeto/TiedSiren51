import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'

export class FakeAuthGateway implements AuthGateway {
  willSucceedForUser: AuthUser = {
    id: 'fake-user-id',
    username: 'Fake User',
  }
  onAuthStatusChangedListener!: (user: AuthUser) => void

  authenticateWithGoogle(): Promise<AuthUser> {
    return Promise.resolve(this.willSucceedForUser)
  }

  onAuthStatusChanged(listener: (user: AuthUser) => void): void {
    this.onAuthStatusChangedListener = listener
  }

  authenticateWithApple(): Promise<AuthUser> {
    return Promise.resolve(this.willSucceedForUser)
  }

  authenticateWithEmail(email: string, password: string): Promise<AuthUser> {
    return Promise.resolve(this.willSucceedForUser)
  }

  simulateAuthStatusChanged(authUser: AuthUser) {
    this.onAuthStatusChangedListener(authUser)
  }
}
