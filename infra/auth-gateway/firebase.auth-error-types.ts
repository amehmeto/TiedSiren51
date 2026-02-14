import { AuthErrorType } from '@/core/auth/auth-error-type'
import { FirebaseAuthErrorCode } from './firebase.auth-error-code'

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
