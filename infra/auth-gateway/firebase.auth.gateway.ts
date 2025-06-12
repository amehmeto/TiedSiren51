import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'
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
import type { FirebaseConfig } from '../firebase/firebaseConfig'

export class FirebaseAuthGateway implements AuthGateway {
  private readonly firebaseConfig: FirebaseConfig

  private readonly auth: Auth

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  private constructor(config: FirebaseConfig) {
    this.firebaseConfig = config
    const app = this.initializeApp()
    this.auth = this.initializeAuth(app)
    this.setupAuthStateListener()
  }

  public static create(config: FirebaseConfig): FirebaseAuthGateway {
    return new FirebaseAuthGateway(config)
  }

  public static createWithDefaultConfig(): FirebaseAuthGateway {
    const { firebaseConfig } = require('../firebase/firebaseConfig')
    return new FirebaseAuthGateway(firebaseConfig)
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
        error instanceof Error &&
        'code' in error &&
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

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const result = await signInWithEmailAndPassword(this.auth, email, password)
    return {
      id: result.user.uid,
      email: result.user.email ?? '',
    }
  }

  async signUpWithEmail(email: string, password: string): Promise<AuthUser> {
    const result = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password,
    )
    return {
      id: result.user.uid,
      email: result.user.email ?? '',
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
    await signOut(this.auth)
  }
}
