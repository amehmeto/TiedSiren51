import { faker } from '@faker-js/faker'
import { AuthProvider, AuthUser } from '../../auth/auth-user'

export function buildAuthUser(
  wantedAuthUser: Partial<AuthUser> = {},
): AuthUser {
  const randomAuthUser: AuthUser = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    isEmailVerified: faker.datatype.boolean(),
    authProvider: AuthProvider.Email,
  }
  return { ...randomAuthUser, ...wantedAuthUser }
}
