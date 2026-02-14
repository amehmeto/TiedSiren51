import { GoogleSignInError } from './firebase.google-sign-in-error'

export const GOOGLE_SIGN_IN_ERRORS: Record<GoogleSignInError, string> = {
  [GoogleSignInError.SignInCancelled]: 'Google sign-in was cancelled.',
  [GoogleSignInError.InProgress]: 'Sign-in already in progress.',
  [GoogleSignInError.PlayServicesNotAvailable]:
    'Google Play Services not available.',
  [GoogleSignInError.MissingIdToken]: 'Failed to get Google ID token',
}
