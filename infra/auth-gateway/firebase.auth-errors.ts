import { FirebaseAuthErrorCode } from './firebase.auth-error-code'

export const FIREBASE_ERRORS: Record<FirebaseAuthErrorCode, string> = {
  [FirebaseAuthErrorCode.EmailAlreadyInUse]: 'Invalid email or password.',
  [FirebaseAuthErrorCode.InvalidEmail]: 'Invalid email address.',
  [FirebaseAuthErrorCode.WeakPassword]:
    'Password must be at least 6 characters.',
  [FirebaseAuthErrorCode.InvalidCredential]: 'Invalid email or password.',
  [FirebaseAuthErrorCode.PopupClosedByUser]: 'Sign-in cancelled.',
  [FirebaseAuthErrorCode.CancelledByUser]: 'Sign-in cancelled.',
  [FirebaseAuthErrorCode.UserNotFound]: 'Invalid email or password.',
  [FirebaseAuthErrorCode.TooManyRequests]:
    'Too many requests. Please try again later.',
  [FirebaseAuthErrorCode.NetworkRequestFailed]:
    'No internet connection. Please check your network and try again.',
  [FirebaseAuthErrorCode.WrongPassword]: 'Incorrect password.',
  [FirebaseAuthErrorCode.RequiresRecentLogin]:
    'Please re-authenticate to perform this action.',
}
