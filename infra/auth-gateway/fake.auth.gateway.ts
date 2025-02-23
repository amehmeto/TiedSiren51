import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'

export class FakeAuthGateway implements AuthGateway {
  willSucceedForUser!: AuthUser

  authenticateWithGoogle(): Promise<AuthUser> {
    return Promise.resolve(this.willSucceedForUser)
  }

  onAuthStateChanged(listener: (user: AuthUser) => void): void {}

  authenticateWithApple(): Promise<AuthUser> {
    return Promise.resolve(this.willSucceedForUser)
  }

  authenticateWithEmail(email: string, password: string): Promise<AuthUser> {
    return Promise.resolve(this.willSucceedForUser)
  }
}
