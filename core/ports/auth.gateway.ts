import { AuthUser } from '@/core/auth/authUser'

export interface AuthGateway {
  onAuthStateChanged(listener: (user: AuthUser) => void): void
  authenticateWithGoogle(): Promise<AuthUser>
}
