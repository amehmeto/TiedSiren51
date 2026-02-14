import { AuthErrorType } from '@/core/auth/auth-error-type'

export enum FirebaseAuthErrorCode {
  EmailAlreadyInUse = 'auth/email-already-in-use',
  InvalidEmail = 'auth/invalid-email',
  WeakPassword = 'auth/weak-password',
  InvalidCredential = 'auth/invalid-credential',
  PopupClosedByUser = 'auth/popup-closed-by-user',
  CancelledByUser = 'auth/cancelled-popup-request',
  UserNotFound = 'auth/user-not-found',
  TooManyRequests = 'auth/too-many-requests',
  NetworkRequestFailed = 'auth/network-request-failed',
  WrongPassword = 'auth/wrong-password',
  RequiresRecentLogin = 'auth/requires-recent-login',
}

export enum GoogleSignInError {
  SignInCancelled = 'SIGN_IN_CANCELLED',
  InProgress = 'IN_PROGRESS',
  PlayServicesNotAvailable = 'PLAY_SERVICES_NOT_AVAILABLE',
  MissingIdToken = 'MISSING_ID_TOKEN',
}

export const FIREBASE_ERROR_TYPES: Record<
  FirebaseAuthErrorCode,
  AuthErrorType
> = {
  [FirebaseAuthErrorCode.EmailAlreadyInUse]: AuthErrorType.Validation,
  [FirebaseAuthErrorCode.InvalidEmail]: AuthErrorType.Validation,
  [FirebaseAuthErrorCode.WeakPassword]: AuthErrorType.Validation,
  [FirebaseAuthErrorCode.InvalidCredential]: AuthErrorType.Credential,
  [FirebaseAuthErrorCode.PopupClosedByUser]: AuthErrorType.Cancelled,
  [FirebaseAuthErrorCode.CancelledByUser]: AuthErrorType.Cancelled,
  [FirebaseAuthErrorCode.UserNotFound]: AuthErrorType.Credential,
  [FirebaseAuthErrorCode.TooManyRequests]: AuthErrorType.RateLimit,
  [FirebaseAuthErrorCode.NetworkRequestFailed]: AuthErrorType.Network,
  [FirebaseAuthErrorCode.WrongPassword]: AuthErrorType.Credential,
  [FirebaseAuthErrorCode.RequiresRecentLogin]: AuthErrorType.Unknown,
}

export const FIREBASE_ERRORS: Record<FirebaseAuthErrorCode, string> = {
  [FirebaseAuthErrorCode.EmailAlreadyInUse]: 'This email is already in use.',
  [FirebaseAuthErrorCode.InvalidEmail]: 'Invalid email address.',
  [FirebaseAuthErrorCode.WeakPassword]:
    'Password must be at least 6 characters.',
  [FirebaseAuthErrorCode.InvalidCredential]: 'Invalid email or password.',
  [FirebaseAuthErrorCode.PopupClosedByUser]: 'Sign-in cancelled.',
  [FirebaseAuthErrorCode.CancelledByUser]: 'Sign-in cancelled.',
  [FirebaseAuthErrorCode.UserNotFound]: 'No account found with this email.',
  [FirebaseAuthErrorCode.TooManyRequests]:
    'Too many requests. Please try again later.',
  [FirebaseAuthErrorCode.NetworkRequestFailed]:
    'No internet connection. Please check your network and try again.',
  [FirebaseAuthErrorCode.WrongPassword]: 'Incorrect password.',
  [FirebaseAuthErrorCode.RequiresRecentLogin]:
    'Please re-authenticate to perform this action.',
}

export const GOOGLE_ERROR_TYPES: Record<GoogleSignInError, AuthErrorType> = {
  [GoogleSignInError.SignInCancelled]: AuthErrorType.Cancelled,
  [GoogleSignInError.InProgress]: AuthErrorType.Unknown,
  [GoogleSignInError.PlayServicesNotAvailable]: AuthErrorType.Unknown,
  [GoogleSignInError.MissingIdToken]: AuthErrorType.Unknown,
}

export const GOOGLE_SIGN_IN_ERRORS: Record<GoogleSignInError, string> = {
  [GoogleSignInError.SignInCancelled]: 'Google sign-in was cancelled.',
  [GoogleSignInError.InProgress]: 'Sign-in already in progress.',
  [GoogleSignInError.PlayServicesNotAvailable]:
    'Google Play Services not available.',
  [GoogleSignInError.MissingIdToken]: 'Failed to get Google ID token',
}
