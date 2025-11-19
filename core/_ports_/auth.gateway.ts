import { AuthUser } from '@/core/auth/authUser'

export interface AuthGateway {
  onUserLoggedIn(listener: (user: AuthUser) => void): void
  onUserLoggedOut(listener: () => void): void
  signInWithGoogle(): Promise<AuthUser>
  signInWithApple(): Promise<AuthUser>
  signUpWithEmail(email: string, password: string): Promise<AuthUser>
  signInWithEmail(email: string, password: string): Promise<AuthUser>
  logOut(): Promise<void>
}
