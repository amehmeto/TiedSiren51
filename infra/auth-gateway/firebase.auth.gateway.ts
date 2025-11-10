import AsyncStorage from '@react-native-async-storage/async-storage'
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
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth'
import { AuthUser } from '@/core/auth/authUser'
import { AuthGateway } from '@/core/ports/auth.gateway'
import { firebaseConfig } from './firebaseConfig'

enum FirebaseAuthErrorCode {
  EmailAlreadyInUse = 'auth/email-already-in-use',
  InvalidEmail = 'auth/invalid-email',
  WeakPassword = 'auth/weak-password',
  InvalidCredential = 'auth/invalid-credential',
}

export class FirebaseAuthGateway implements AuthGateway {
  private static readonly FIREBASE_CONFIG = firebaseConfig

  private static readonly ERROR_MESSAGES: Record<string, string> = {
    [FirebaseAuthErrorCode.EmailAlreadyInUse]: 'This email is already in use.',
    [FirebaseAuthErrorCode.InvalidEmail]: 'Invalid email address.',
    [FirebaseAuthErrorCode.WeakPassword]:
      'Password must be at least 6 characters.',
    [FirebaseAuthErrorCode.InvalidCredential]: 'Invalid email or password.',
  }

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
      )
        return getAuth(app)

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

      if (!user && this.onUserLoggedOutListener) this.onUserLoggedOutListener()
    })
  }

  private translateFirebaseError(error: unknown): string {
    if (this.isFirebaseError(error))
      return FirebaseAuthGateway.ERROR_MESSAGES[error.code] ?? error.message

    return error instanceof Error ? error.message : 'Unknown error occurred.'
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
    throw new Error('Google auth not implemented yet')
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
