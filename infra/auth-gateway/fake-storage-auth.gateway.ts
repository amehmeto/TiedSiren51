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
      this.fakeAuthGateway.simulateUserLoggedIn(authUser)
      this.fakeAuthGateway.simulateUserLoggedIn(authUser)
      return authUser
    } catch (error) {
      throw error
    }
  }

  async authenticateWithGoogle(): Promise<AuthUser> {
    try {
      const authUser = await this.fakeAuthGateway.authenticateWithGoogle()
      await AsyncStorage.setItem('fake-auth-user', JSON.stringify(authUser))
      this.fakeAuthGateway.simulateUserLoggedIn(authUser)
      return authUser
    } catch (error) {
      throw error
    }
  }

  onUserLoggedIn(listener: (user: AuthUser) => void): void {
    this.fakeAuthGateway.onUserLoggedIn(listener)
  }

  onUserLoggedOut(listener: () => void): void {
    this.fakeAuthGateway.onUserLoggedOut(listener)
  }
  async logOut(): Promise<void> {
    await AsyncStorage.removeItem('fake-auth-user')
    return this.fakeAuthGateway.logOut()
  }

  private async verifyUserIsAuthenticated(): Promise<void> {
    try {
      const maybeAuthUser = await AsyncStorage.getItem('fake-auth-user')

      if (maybeAuthUser !== null) {
        const parsedAuthUser = JSON.parse(maybeAuthUser)
        this.fakeAuthGateway.simulateUserLoggedIn(parsedAuthUser)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Error verifying authentication:', error)
    }
  }
}
