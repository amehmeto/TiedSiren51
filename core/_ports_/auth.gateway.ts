import { AuthUser } from '@/core/auth/auth-user'

export enum EmailVerificationResult {
  Verified = 'VERIFIED',
  AlreadyVerified = 'ALREADY_VERIFIED',
}

export interface AuthGateway {
  onUserLoggedIn(listener: (user: AuthUser) => void): void
  onUserLoggedOut(listener: () => void): void
  signInWithGoogle(): Promise<AuthUser>
  signInWithApple(): Promise<AuthUser>
  signUpWithEmail(email: string, password: string): Promise<AuthUser>
  signInWithEmail(email: string, password: string): Promise<AuthUser>
  reauthenticate(password: string): Promise<void>
  changePassword(newPassword: string): Promise<void>
  reauthenticateWithGoogle(): Promise<void>
  resetPassword(email: string): Promise<void>
  /** @param oobCode - Out-of-band code from Firebase password reset email link */
  confirmPasswordReset(oobCode: string, newPassword: string): Promise<void>
  sendVerificationEmail(): Promise<void>
  /** @param oobCode - Out-of-band code from Firebase email verification deep link */
  applyEmailVerificationCode(oobCode: string): Promise<EmailVerificationResult>
  deleteAccount(): Promise<void>
  logOut(): Promise<void>
}
