import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthGateway } from '@/core/_ports_/auth.gateway'
import { Logger } from '@/core/_ports_/logger'
import { AuthUser } from '@/core/auth/auth-user'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'

export class FakeStorageAuthGateway implements AuthGateway {
  constructor(
    private readonly fakeAuthGateway: FakeAuthGateway,
    private readonly logger: Logger,
  ) {
    this.verifyUserIsAuthenticated().catch((err) =>
      this.logger.error(
        `[FakeStorageAuthGateway] Failed to verify authentication: ${err}`,
      ),
    )
  }

  async signUpWithEmail(email: string, password: string): Promise<AuthUser> {
    const authUser = await this.fakeAuthGateway.signUpWithEmail(email, password)
    await AsyncStorage.setItem('fake-auth-user', JSON.stringify(authUser))
    this.fakeAuthGateway.simulateUserLoggedIn(authUser)
    return authUser
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const authUser = await this.fakeAuthGateway.signInWithEmail(email, password)
    await AsyncStorage.setItem('fake-auth-user', JSON.stringify(authUser))
    this.fakeAuthGateway.simulateUserLoggedIn(authUser)
    return authUser
  }

  async signInWithApple(): Promise<AuthUser> {
    const authUser = await this.fakeAuthGateway.signInWithApple()
    await AsyncStorage.setItem('fake-auth-user', JSON.stringify(authUser))
    this.fakeAuthGateway.simulateUserLoggedIn(authUser)
    return authUser
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const authUser = await this.fakeAuthGateway.signInWithGoogle()
    await AsyncStorage.setItem('fake-auth-user', JSON.stringify(authUser))
    this.fakeAuthGateway.simulateUserLoggedIn(authUser)
    return authUser
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

  async reauthenticate(password: string): Promise<void> {
    return this.fakeAuthGateway.reauthenticate(password)
  }

  async changePassword(newPassword: string): Promise<void> {
    return this.fakeAuthGateway.changePassword(newPassword)
  }

  async reauthenticateWithGoogle(): Promise<void> {
    return this.fakeAuthGateway.reauthenticateWithGoogle()
  }

  async resetPassword(email: string): Promise<void> {
    return this.fakeAuthGateway.resetPassword(email)
  }

  async sendVerificationEmail(): Promise<void> {
    return this.fakeAuthGateway.sendVerificationEmail()
  }

  async refreshEmailVerificationStatus(): Promise<boolean> {
    return this.fakeAuthGateway.refreshEmailVerificationStatus()
  }

  async deleteAccount(): Promise<void> {
    await AsyncStorage.removeItem('fake-auth-user')
    return this.fakeAuthGateway.deleteAccount()
  }

  private async verifyUserIsAuthenticated(): Promise<void> {
    try {
      const maybeAuthUser = await AsyncStorage.getItem('fake-auth-user')

      if (maybeAuthUser !== null) {
        const parsedAuthUser = JSON.parse(maybeAuthUser)
        this.fakeAuthGateway.simulateUserLoggedIn(parsedAuthUser)
      }
    } catch (error) {
      this.logger.warn(
        `[FakeStorageAuthGateway] Error verifying authentication: ${error}`,
      )
      throw error
    }
  }
}
