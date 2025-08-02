import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'
import { AuthError, createAuthError } from '@/core/auth/authError'
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
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

  private isFirebaseError(
    error: unknown,
  ): error is { code: string; message: string } {
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

  private translateFirebaseError(error: unknown): AuthError {
    const firebaseErrorMessages: Record<
      string,
      { message: string; field?: AuthError['field'] }
    > = {
      'auth/email-already-in-use': {
        message: 'This email is already in use.',
        field: 'email',
      },
      'auth/invalid-email': {
        message: 'Invalid email address.',
        field: 'email',
      },
      'auth/weak-password': {
        message: 'Password must be at least 6 characters.',
        field: 'password',
      },
      'auth/invalid-credential': {
        message: 'Invalid credentials.',
        field: 'general',
      },
    }

    if (this.isFirebaseError(error)) {
      const errorConfig = firebaseErrorMessages[error.code]
      if (errorConfig) {
        return createAuthError(
          errorConfig.message,
          error.code,
          errorConfig.field,
        )
      }
      return createAuthError(error.message, error.code)
    }

    return createAuthError(
      error instanceof Error ? error.message : 'Unknown error occurred.',
    )
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
      throw this.translateFirebaseError(error)
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
      throw this.translateFirebaseError(error)
    }
  }

  async signInWithGoogle(): Promise<AuthUser> {
    throw createAuthError('Google auth not implemented yet')
  }

  async signInWithApple(): Promise<AuthUser> {
    throw createAuthError('Apple auth not implemented yet')
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
      throw this.translateFirebaseError(error)
    }
  }
}
