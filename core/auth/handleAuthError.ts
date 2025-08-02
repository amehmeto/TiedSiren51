import { AuthError } from './authError'

export function handleAuthError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as AuthError).message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown error occurred.'
}
