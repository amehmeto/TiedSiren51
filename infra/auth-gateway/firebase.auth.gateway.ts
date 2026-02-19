import AsyncStorage from '@react-native-async-storage/async-storage'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import {
  FirebaseApp,
  FirebaseError,
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app'
import {
  applyActionCode,
  Auth,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
  initializeAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  User,
} from 'firebase/auth'
import { AuthGateway } from '@/core/_ports_/auth.gateway'
import { Logger } from '@/core/_ports_/logger'
import { AuthError } from '@/core/auth/auth-error'
import { AuthErrorType } from '@/core/auth/auth-error-type'
import { AuthProvider, AuthUser } from '@/core/auth/auth-user'
import { FirebaseAuthErrorCode } from './firebase.auth-error-code'
import { FIREBASE_ERROR_TYPES } from './firebase.auth-error-types'
import { FIREBASE_ERRORS } from './firebase.auth-errors'
import { GOOGLE_ERROR_TYPES } from './firebase.google-error-types'
import { GoogleSignInError } from './firebase.google-sign-in-error'
import { GOOGLE_SIGN_IN_ERRORS } from './firebase.google-sign-in-errors'
import { firebaseConfig } from './firebaseConfig'

export class FirebaseAuthGateway implements AuthGateway {
  private readonly auth: Auth

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  private isFirebaseError(error: unknown): error is FirebaseError {
    return error instanceof FirebaseError
  }

  private isFirebaseAuthError(
    error: unknown,
  ): error is FirebaseError & { code: FirebaseAuthErrorCode } {
    return this.isFirebaseError(error) && error.code in FIREBASE_ERRORS
  }

  private getGoogleSignInErrorPattern(error: Error): GoogleSignInError | null {
    for (const pattern of Object.values(GoogleSignInError))
      if (error.message.includes(pattern)) return pattern

    return null
  }

  private isGoogleSignInError(error: unknown): error is Error {
    if (!(error instanceof Error)) return false

    const pattern = this.getGoogleSignInErrorPattern(error)
    return !!pattern
  }

  public constructor(private readonly logger: Logger) {
    const app = this.initializeApp()
    this.auth = this.initializeAuth(app)
    this.setupAuthStateListener()
    this.configureGoogleSignIn()
  }

  private initializeApp(): FirebaseApp {
    return getApps().length ? getApp() : initializeApp(firebaseConfig)
  }

  private initializeAuth(app: FirebaseApp): Auth {
    try {
      return initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      })
    } catch (error) {
      if (
        this.isFirebaseError(error) &&
        error.code === 'auth/already-initialized'
      ) {
        this.logger.warn(
          `[FirebaseAuthGateway] Auth already initialized, using existing instance`,
        )
        return getAuth(app)
      }

      this.logger.error(
        `[FirebaseAuthGateway] Failed to initialize auth: ${error}`,
      )
      throw error
    }
  }

  private mapProviderId(providerId: string): AuthProvider {
    const providerMap: Record<string, AuthProvider> = {
      'google.com': AuthProvider.Google,
      'apple.com': AuthProvider.Apple,
      password: AuthProvider.Email,
    }
    return providerMap[providerId] ?? AuthProvider.Email
  }

  private getAuthProvider(user: User): AuthProvider {
    const firebaseProviderId = user.providerData[0]?.providerId ?? 'password'
    return this.mapProviderId(firebaseProviderId)
  }

  private setupAuthStateListener(): void {
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user && this.onUserLoggedInListener) {
        this.onUserLoggedInListener({
          id: user.uid,
          email: user.email ?? '',
          isEmailVerified: user.emailVerified,
          authProvider: this.getAuthProvider(user),
        })
        return
      }

      if (!user && this.onUserLoggedOutListener) this.onUserLoggedOutListener()
    })
  }

  private configureGoogleSignIn(): void {
    GoogleSignin.configure({
      webClientId: firebaseConfig.webClientId,
    })
  }

  private toAuthError(error: unknown): AuthError {
    if (this.isFirebaseAuthError(error)) {
      return new AuthError(
        FIREBASE_ERRORS[error.code],
        FIREBASE_ERROR_TYPES[error.code],
      )
    }

    if (this.isGoogleSignInError(error)) {
      const pattern = this.getGoogleSignInErrorPattern(error)
      if (pattern) {
        return new AuthError(
          GOOGLE_SIGN_IN_ERRORS[pattern],
          GOOGLE_ERROR_TYPES[pattern],
        )
      }
    }

    const message =
      error && error instanceof Error
        ? error.message
        : 'Unknown error occurred.'
    return new AuthError(message, AuthErrorType.Unknown)
  }

  async reauthenticate(password: string): Promise<void> {
    try {
      const user = this.auth.currentUser
      if (!user?.email) throw new Error('No authenticated user found.')

      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to reauthenticate: ${error}`,
      )
      throw this.toAuthError(error)
    }
  }

  async reauthenticateWithGoogle(): Promise<void> {
    try {
      const user = this.auth.currentUser
      if (!user) throw new Error('No authenticated user found.')

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      const userInfo = await GoogleSignin.signIn()
      const idToken = userInfo.idToken
      if (!idToken) throw new Error(GoogleSignInError.MissingIdToken)

      const googleCredential = GoogleAuthProvider.credential(idToken)
      await reauthenticateWithCredential(user, googleCredential)
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to reauthenticateWithGoogle: ${error}`,
      )
      throw this.toAuthError(error)
    }
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const signInResponse = await signInWithEmailAndPassword(
        this.auth,
        email,
        password,
      )
      return {
        id: signInResponse.user.uid,
        email: signInResponse.user.email ?? '',
        isEmailVerified: signInResponse.user.emailVerified,
        authProvider: this.getAuthProvider(signInResponse.user),
      }
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to signInWithEmail: ${error}`,
      )
      throw this.toAuthError(error)
    }
  }

  async signUpWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const signUpResponse = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      )

      this.trySendVerificationEmail(signUpResponse.user)

      return {
        id: signUpResponse.user.uid,
        email: signUpResponse.user.email ?? '',
        isEmailVerified: signUpResponse.user.emailVerified,
        authProvider: this.getAuthProvider(signUpResponse.user),
      }
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to signUpWithEmail: ${error}`,
      )
      throw this.toAuthError(error)
    }
  }

  async signInWithGoogle(): Promise<AuthUser> {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })

      const userInfo = await GoogleSignin.signIn()

      const idToken = userInfo.idToken

      if (!idToken) throw new Error(GoogleSignInError.MissingIdToken)

      const googleCredential = GoogleAuthProvider.credential(idToken)

      const credential = await signInWithCredential(this.auth, googleCredential)

      return {
        id: credential.user.uid,
        email: credential.user.email ?? '',
        isEmailVerified: credential.user.emailVerified,
        username: credential.user.displayName ?? undefined,
        profilePicture: credential.user.photoURL ?? undefined,
        authProvider: this.getAuthProvider(credential.user),
      }
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to signInWithGoogle: ${error}`,
      )
      throw this.toAuthError(error)
    }
  }

  async signInWithApple(): Promise<AuthUser> {
    try {
      throw new Error('Apple auth not implemented yet')
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to signInWithApple: ${error}`,
      )
      throw this.toAuthError(error)
    }
  }

  async changePassword(newPassword: string): Promise<void> {
    try {
      const user = this.auth.currentUser
      if (!user) throw new Error('No authenticated user found.')

      await updatePassword(user, newPassword)
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to change password: ${error}`,
      )
      throw this.toAuthError(error)
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email)
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to resetPassword: ${error}`,
      )
      throw this.toAuthError(error)
    }
  }

  async confirmPasswordReset(
    oobCode: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await firebaseConfirmPasswordReset(this.auth, oobCode, newPassword)
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to confirmPasswordReset: ${error}`,
      )
      throw this.toAuthError(error)
    }
  }

  private trySendVerificationEmail(user: User): void {
    sendEmailVerification(user).catch((error) => {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to send verification email: ${error}`,
      )
    })
  }

  async sendVerificationEmail(): Promise<void> {
    try {
      const user = this.auth.currentUser
      if (!user) throw new Error('No authenticated user found.')
      await sendEmailVerification(user)
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to sendVerificationEmail: ${error}`,
      )
      throw this.toAuthError(error)
    }
  }

  async applyEmailVerificationCode(oobCode: string): Promise<void> {
    try {
      await applyActionCode(this.auth, oobCode)
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to applyEmailVerificationCode: ${error}`,
      )
      throw this.toEmailVerificationError(error)
    }
  }

  private toEmailVerificationError(error: unknown): AuthError {
    if (this.isFirebaseAuthError(error)) {
      const verificationMessages: Partial<
        Record<FirebaseAuthErrorCode, string>
      > = {
        [FirebaseAuthErrorCode.ExpiredActionCode]:
          'Verification link has expired. Please request a new one.',
        [FirebaseAuthErrorCode.InvalidActionCode]: 'Invalid verification link.',
        [FirebaseAuthErrorCode.NetworkRequestFailed]:
          'Could not verify email. Please check your connection.',
      }
      const message =
        verificationMessages[error.code] ?? FIREBASE_ERRORS[error.code]
      return new AuthError(message, FIREBASE_ERROR_TYPES[error.code])
    }

    return this.toAuthError(error)
  }

  async refreshEmailVerificationStatus(): Promise<boolean> {
    try {
      const user = this.auth.currentUser
      if (!user) throw new Error('No authenticated user found.')
      await user.reload()
      return user.emailVerified
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to refreshEmailVerificationStatus: ${error}`,
      )
      throw this.toAuthError(error)
    }
  }

  onUserLoggedIn(listener: (user: AuthUser) => void): void {
    this.onUserLoggedInListener = listener
  }

  onUserLoggedOut(listener: () => void): void {
    this.onUserLoggedOutListener = listener
  }

  async deleteAccount(): Promise<void> {
    try {
      const user = this.auth.currentUser
      if (!user) throw new Error('No authenticated user found.')

      await deleteUser(user)
    } catch (error) {
      this.logger.error(
        `[FirebaseAuthGateway] Failed to delete account: ${error}`,
      )
      throw this.toAuthError(error)
    }
  }

  async logOut(): Promise<void> {
    try {
      if (await GoogleSignin.isSignedIn()) await GoogleSignin.signOut()
      await signOut(this.auth)
    } catch (error) {
      this.logger.error(`[FirebaseAuthGateway] Failed to logOut: ${error}`)
      throw this.toAuthError(error)
    }
  }
}
