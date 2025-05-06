import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import AsyncStorage from '@react-native-async-storage/async-storage'

export class FakeStorageAuthGateway implements AuthGateway {
  constructor(private readonly fakeAuthGateway: FakeAuthGateway) {
    this.verifyUserIsAuthenticated().catch((err) =>
      // eslint-disable-next-line no-console
      console.error('Failed to verify authentication:', err),
    )
  }

  authenticateWithEmail(email: string, password: string): Promise<AuthUser> {
    throw new Error('Method not implemented.')
    //return Promise.resolve(undefined)
  }

  async authenticateWithApple(): Promise<AuthUser> {
    try {
      const authUser = await this.fakeAuthGateway.authenticateWithApple()
      await AsyncStorage.setItem('fake-auth-user', JSON.stringify(authUser))
      this.fakeAuthGateway.onAuthStatusChangedListener(authUser)
      return authUser
    } catch (error) {
      throw error
    }
  }

  async authenticateWithGoogle(): Promise<AuthUser> {
    try {
      const authUser = await this.fakeAuthGateway.authenticateWithGoogle()
      await AsyncStorage.setItem('fake-auth-user', JSON.stringify(authUser))
      this.fakeAuthGateway.onAuthStatusChangedListener(authUser)
      return authUser
    } catch (error) {
      throw error
    }
  }

  onAuthStatusChanged(listener: (user: AuthUser) => void): void {
    this.fakeAuthGateway.onAuthStatusChanged(listener)
  }

  private async verifyUserIsAuthenticated(): Promise<void> {
    try {
      const maybeAuthUser = await AsyncStorage.getItem('fake-auth-user')

      if (maybeAuthUser !== null) {
        const parsedAuthUser = JSON.parse(maybeAuthUser)
        this.fakeAuthGateway.simulateAuthStatusChanged(parsedAuthUser)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Error verifying authentication:', error)
    }
  }
}
