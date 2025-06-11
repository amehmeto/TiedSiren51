import { AuthGateway } from '@/core/ports/auth.gateway'
import { AuthUser } from '@/core/auth/authUser'
import { auth } from '../firebase/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'

export class FirebaseAuthGateway implements AuthGateway {
  private onUserLoggedInListener: ((user: AuthUser) => void) | null = null

  private onUserLoggedOutListener: (() => void) | null = null

  constructor() {
    onAuthStateChanged(auth, (user: User | null) => {
      if (user && this.onUserLoggedInListener) {
        this.onUserLoggedInListener({
          id: user.uid,
          username: user.email ?? user.uid,
        })
      } else if (!user && this.onUserLoggedOutListener) {
        this.onUserLoggedOutListener()
      }
    })
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return {
      id: result.user.uid,
      username: result.user.email ?? result.user.uid,
    }
  }

  async authenticateWithEmail(
    email: string,
    password: string,
  ): Promise<AuthUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return {
      id: result.user.uid,
      username: result.user.email ?? result.user.uid,
    }
  }

  async authenticateWithGoogle(): Promise<AuthUser> {
    throw new Error('Google auth not implemented yet')
  }

  async authenticateWithApple(): Promise<AuthUser> {
    throw new Error('Apple auth not implemented yet')
  }

  onUserLoggedIn(listener: (user: AuthUser) => void): void {
    this.onUserLoggedInListener = listener
  }

  onUserLoggedOut(listener: () => void): void {
    this.onUserLoggedOutListener = listener
  }

  async logOut(): Promise<void> {
    await signOut(auth)
  }
}
