export enum AuthProvider {
  Email = 'email',
  Google = 'google',
  Apple = 'apple',
}

export type AuthUser = {
  id: string
  email: string
  isEmailVerified: boolean
  username?: string
  profilePicture?: string
  authProvider?: AuthProvider
}
