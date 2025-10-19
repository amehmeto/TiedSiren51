import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'
import {
  initializeApp,
  getApps,
  getApp,
  FirebaseApp,
  FirebaseError,
} from 'firebase/app'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithCredential,
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

export class FirebaseAuthGateway implements AuthGateway {
  private static readonly FIREBASE_CONFIG = firebaseConfig

  private readonly firebaseConfig: typeof firebaseConfig

  private readonly auth: Auth

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  private isFirebaseError(error: unknown): error is FirebaseError {
    return (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error &&
      typeof error['code'] === 'string' &&
      typeof error['message'] === 'string'
    )
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
    if (this.isFirebaseError(error)) {
      if (error.code === FirebaseAuthErrorCode.EmailAlreadyInUse) {
        return 'This email is already in use.'
      }

      if (error.code === FirebaseAuthErrorCode.InvalidEmail) {
        return 'Invalid email address.'
      }

      if (error.code === FirebaseAuthErrorCode.WeakPassword) {
        return 'Password must be at least 6 characters.'
      }

      if (error.code === FirebaseAuthErrorCode.InvalidCredential) {
        return 'Invalid email or password.'
      }

      if (
        error.code === FirebaseAuthErrorCode.PopupClosedByUser ||
        error.code === FirebaseAuthErrorCode.CancelledByUser
      ) {
        return 'Sign-in cancelled.'
      }
      return error.message
    }

    if (error instanceof Error) {
      if (error.message.includes('SIGN_IN_CANCELLED')) {
        return 'Google sign-in was cancelled.'
      }

      if (error.message.includes('IN_PROGRESS')) {
        return 'Sign-in already in progress.'
      }

      if (error.message.includes('PLAY_SERVICES_NOT_AVAILABLE')) {
        return 'Google Play Services not available.'
      }
      return error.message
    }

    return 'Unknown error occurred.'
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

      if (!idToken) {
        throw new Error('Failed to get Google ID token')
      }

      const googleCredential = GoogleAuthProvider.credential(idToken)

      const result = await signInWithCredential(this.auth, googleCredential)

      return {
        id: result.user.uid,
        email: result.user.email ?? '',
        username: result.user.displayName ?? undefined,
        profilePicture: result.user.photoURL ?? undefined,
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
