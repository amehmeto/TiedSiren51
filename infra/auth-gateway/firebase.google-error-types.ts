import { AuthErrorType } from '@/core/auth/auth-error-type'
import { GoogleSignInError } from './firebase.google-sign-in-error'

export const GOOGLE_ERROR_TYPES: Record<GoogleSignInError, AuthErrorType> = {
  [GoogleSignInError.SignInCancelled]: AuthErrorType.Cancelled,
  [GoogleSignInError.InProgress]: AuthErrorType.Unknown,
  [GoogleSignInError.PlayServicesNotAvailable]: AuthErrorType.Unknown,
  [GoogleSignInError.MissingIdToken]: AuthErrorType.Unknown,
}
