import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'
import {
  FirebaseApp,
  FirebaseError,
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app'
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
  initializeAuth,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { firebaseConfig } from './firebaseConfig'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

enum FirebaseAuthErrorCode {
  EmailAlreadyInUse = 'auth/email-already-in-use',
  InvalidEmail = 'auth/invalid-email',
  WeakPassword = 'auth/weak-password',
  InvalidCredential = 'auth/invalid-credential',
  PopupClosedByUser = 'auth/popup-closed-by-user',
  CancelledByUser = 'auth/cancelled-popup-request',
}

enum GoogleSignInError {
  SignInCancelled = 'SIGN_IN_CANCELLED',
  InProgress = 'IN_PROGRESS',
  PlayServicesNotAvailable = 'PLAY_SERVICES_NOT_AVAILABLE',
  MissingIdToken = 'MISSING_ID_TOKEN',
}

export class FirebaseAuthGateway implements AuthGateway {
  private static readonly FIREBASE_CONFIG = firebaseConfig

  private static readonly FIREBASE_ERRORS: Record<
    FirebaseAuthErrorCode,
    string
  > = {
    [FirebaseAuthErrorCode.EmailAlreadyInUse]: 'This email is already in use.',
    [FirebaseAuthErrorCode.InvalidEmail]: 'Invalid email address.',
    [FirebaseAuthErrorCode.WeakPassword]:
      'Password must be at least 6 characters.',
    [FirebaseAuthErrorCode.InvalidCredential]: 'Invalid email or password.',
    [FirebaseAuthErrorCode.PopupClosedByUser]: 'Sign-in cancelled.',
    [FirebaseAuthErrorCode.CancelledByUser]: 'Sign-in cancelled.',
  }

  private static readonly GOOGLE_SIGN_IN_ERRORS: Record<
    GoogleSignInError,
    string
  > = {
    [GoogleSignInError.SignInCancelled]: 'Google sign-in was cancelled.',
    [GoogleSignInError.InProgress]: 'Sign-in already in progress.',
    [GoogleSignInError.PlayServicesNotAvailable]:
      'Google Play Services not available.',
    [GoogleSignInError.MissingIdToken]: 'Failed to get Google ID token',
  }

  private readonly firebaseConfig: typeof firebaseConfig

  private readonly auth: Auth

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  private isFirebaseError(error: unknown): error is FirebaseError {
    return error instanceof FirebaseError
  }

  private isFirebaseAuthError(
    error: unknown,
  ): error is FirebaseError & { code: FirebaseAuthErrorCode } {
    return (
      this.isFirebaseError(error) &&
      Object.values(FirebaseAuthErrorCode).includes(
        error.code as FirebaseAuthErrorCode,
      )
    )
  }

  private getGoogleSignInErrorPattern(error: Error): GoogleSignInError | null {
    for (const pattern of Object.values(GoogleSignInError)) {
      if (error.message.includes(pattern)) return pattern
    }
    return null
  }

  private isGoogleSignInError(error: unknown): error is Error {
    if (!(error instanceof Error)) return false

    const pattern = this.getGoogleSignInErrorPattern(error)
    return !!pattern
  }

  public constructor() {
    this.firebaseConfig = FirebaseAuthGateway.FIREBASE_CONFIG
    const app = this.initializeApp()
    this.auth = this.initializeAuth(app)
    this.setupAuthStateListener()
    this.configureGoogleSignIn()
  }

  private initializeApp(): FirebaseApp {
    return getApps().length ? getApp() : initializeApp(this.firebaseConfig)
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
        return getAuth(app)
      }
      throw error
    }
  }

  private setupAuthStateListener(): void {
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user && this.onUserLoggedInListener) {
        this.onUserLoggedInListener({
          id: user.uid,
          email: user.email ?? '',
        })
        return
      }

      if (!user && this.onUserLoggedOutListener) {
        this.onUserLoggedOutListener()
      }
    })
  }

  private configureGoogleSignIn(): void {
    GoogleSignin.configure({
      webClientId: this.firebaseConfig.webClientId,
    })
  }

  private translateFirebaseError(error: unknown): string {
    if (this.isFirebaseAuthError(error))
      return FirebaseAuthGateway.FIREBASE_ERRORS[error.code]

    if (this.isGoogleSignInError(error)) {
      const pattern = this.getGoogleSignInErrorPattern(error)
      if (pattern) return FirebaseAuthGateway.GOOGLE_SIGN_IN_ERRORS[pattern]
    }

    return error && error instanceof Error
      ? error.message
      : 'Unknown error occurred.'
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const result = await signInWithEmailAndPassword(
        this.auth,
        email,
        password,
      )
      return {
        id: result.user.uid,
        email: result.user.email ?? '',
      }
    } catch (error) {
      throw new Error(this.translateFirebaseError(error))
    }
  }

  async signUpWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const result = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      )
      return {
        id: result.user.uid,
        email: result.user.email ?? '',
      }
    } catch (error) {
      throw new Error(this.translateFirebaseError(error))
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
        username: credential.user.displayName ?? undefined,
        profilePicture: credential.user.photoURL ?? undefined,
      }
    } catch (error) {
      throw new Error(this.translateFirebaseError(error))
    }
  }

  async signInWithApple(): Promise<AuthUser> {
    throw new Error('Apple auth not implemented yet')
  }

  onUserLoggedIn(listener: (user: AuthUser) => void): void {
    this.onUserLoggedInListener = listener
  }

  onUserLoggedOut(listener: () => void): void {
    this.onUserLoggedOutListener = listener
  }

  async logOut(): Promise<void> {
    try {
      await signOut(this.auth)
    } catch (error) {
      throw new Error(this.translateFirebaseError(error))
    }
  }
}
