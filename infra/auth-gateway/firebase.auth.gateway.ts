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

type FirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

export class FirebaseAuthGateway implements AuthGateway {
  private static readonly FIREBASE_CONFIG: FirebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID!,
  }

  private readonly firebaseConfig: FirebaseConfig

  private readonly auth: Auth

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

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
