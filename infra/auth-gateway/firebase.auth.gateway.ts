import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { firebaseConfig } from '../firebase/firebaseConfig'

export class FirebaseAuthGateway implements AuthGateway {
  private auth

  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  constructor() {
    const app = initializeApp(firebaseConfig)
    this.auth = getAuth(app)
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
