import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'

export class FakeStorageAuthGateway implements AuthGateway {
  constructor(private readonly fakeAuthGateway: FakeAuthGateway) {
    this.verifyUserIsAuthenticated()
  }

  async authenticateWithApple(): Promise<AuthUser> {
    const authUser = await this.fakeAuthGateway.authenticateWithApple()
    localStorage.setItem('fake-auth-user', JSON.stringify(authUser))
    this.fakeAuthGateway.onAuthStatusChangedListener(authUser)
    return authUser
  }

  authenticateWithEmail(email: string, password: string): Promise<AuthUser> {
    throw new Error('Method not implemented.')
    //return Promise.resolve(undefined)
  }

  async authenticateWithGoogle(): Promise<AuthUser> {
    const authUser = await this.fakeAuthGateway.authenticateWithGoogle()
    localStorage.setItem('fake-auth-user', JSON.stringify(authUser))
    return authUser
  }

  onAuthStatusChanged(listener: (user: AuthUser) => void): void {}

  private verifyUserIsAuthenticated() {
    const maybeAuthUser = localStorage.getItem('fake-auth-user')

    if (maybeAuthUser !== null) {
      const parsedAuthUser = JSON.parse(maybeAuthUser)
      this.fakeAuthGateway.simulateAuthStatusChanged(parsedAuthUser)
    }
  }
}
