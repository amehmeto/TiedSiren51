export interface AuthError {
  message: string
  code?: string
  field?: 'email' | 'password' | 'general'
}

export const createAuthError = (
  message: string,
  code?: string,
  field?: AuthError['field'],
): AuthError => ({
  message,
  code,
  field,
})
