import { AuthUser } from '@/core/auth/authUser'

export interface AuthGateway {
  onAuthStatusChanged(listener: (user: AuthUser) => void): void
  authenticateWithGoogle(): Promise<AuthUser>
  authenticateWithApple(): Promise<AuthUser>
  authenticateWithEmail(email: string, password: string): Promise<AuthUser>
}
