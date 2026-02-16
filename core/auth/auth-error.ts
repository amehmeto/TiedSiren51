import { AuthErrorType } from '@/core/auth/auth-error-type'

export class AuthError extends Error {
  readonly code: AuthErrorType

  constructor(message: string, code: AuthErrorType) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}
