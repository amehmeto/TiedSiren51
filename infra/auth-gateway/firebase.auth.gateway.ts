import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'
import { initializeApp } from 'firebase/app'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  initializeAuth,
  getReactNativePersistence,
  Auth,
} from 'firebase/auth'
import { firebaseConfig } from '../firebase/firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'

export class FirebaseAuthGateway implements AuthGateway {
  private auth!: Auth

  private readonly firebaseConfig = firebaseConfig

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  constructor() {
    this.initializeFirebase()
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user && this.onUserLoggedInListener) {
        this.onUserLoggedInListener({
          id: user.uid,
          username: user.email ?? user.uid,
        })
        return
      }
      if (!user && this.onUserLoggedOutListener) {
        this.onUserLoggedOutListener()
      }
    })
  }

  private initializeFirebase() {
    const app = initializeApp(this.firebaseConfig)
    this.auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const result = await signInWithEmailAndPassword(this.auth, email, password)
    return {
      id: result.user.uid,
      username: result.user.email ?? result.user.uid,
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
      username: result.user.email ?? result.user.uid,
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
