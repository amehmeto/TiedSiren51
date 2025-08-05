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
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { firebaseConfig } from './firebaseConfig'

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

  private translateFirebaseError(error: unknown): string {
    const firebaseErrorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'This email is already in use.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-credential': 'Invalid credentials.',
    }

    if (this.isFirebaseError(error)) {
      return firebaseErrorMessages[error.code] || error.message
    }

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
