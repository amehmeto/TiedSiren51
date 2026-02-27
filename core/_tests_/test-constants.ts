import { AuthProvider, AuthUser } from '@/core/auth/auth-user'

export const TEST_USER_ID = 'test-user-id'

export const TEST_AUTH_USER: AuthUser = {
  id: TEST_USER_ID,
  email: 'test@test.com',
  isEmailVerified: true,
  authProvider: AuthProvider.Email,
}
