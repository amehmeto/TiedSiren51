import { AuthUser } from '@/core/auth/auth-user'

export interface AuthGateway {
  onUserLoggedIn(listener: (user: AuthUser) => void): void
  onUserLoggedOut(listener: () => void): void
  signInWithGoogle(): Promise<AuthUser>
  signInWithApple(): Promise<AuthUser>
  signUpWithEmail(email: string, password: string): Promise<AuthUser>
  signInWithEmail(email: string, password: string): Promise<AuthUser>
  reauthenticate(password: string): Promise<void>
  changePassword(newPassword: string): Promise<void>
  resetPassword(email: string): Promise<void>
  logOut(): Promise<void>
  deleteAccount(): Promise<void>
}
