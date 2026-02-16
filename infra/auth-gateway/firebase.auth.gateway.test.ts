import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { FirebaseError } from 'firebase/app'
import * as firebaseAuth from 'firebase/auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthMethod } from '@/core/auth/auth.type'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { FirebaseAuthGateway } from './firebase.auth.gateway'

vi.mock('firebase/app', () => {
  class MockFirebaseError extends Error {
    code: string

    constructor(code: string, message: string) {
      super(message)
      this.code = code
      this.name = 'FirebaseError'
    }
  }

  return {
    initializeApp: vi.fn(() => ({})),
    getApps: vi.fn(() => []),
    getApp: vi.fn(() => ({})),
    FirebaseError: MockFirebaseError,
  }
})

vi.mock('firebase/auth', () => ({
  initializeAuth: vi.fn(() => ({})),
  getReactNativePersistence: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithCredential: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: {
    credential: vi.fn(),
  },
  signOut: vi.fn(),
}))

vi.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: vi.fn(),
    hasPlayServices: vi.fn(),
    signIn: vi.fn(),
    isSignedIn: vi.fn().mockResolvedValue(false),
    signOut: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {},
}))

vi.mock('./firebaseConfig', () => ({
  firebaseConfig: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    webClientId: 'test-web-client-id',
  },
}))

describe('FirebaseAuthGateway - Error Translation', () => {
  let gateway: FirebaseAuthGateway

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(firebaseAuth.signOut).mockResolvedValue(undefined)
    vi.mocked(GoogleSignin.isSignedIn).mockResolvedValue(false)
    vi.mocked(GoogleSignin.signOut).mockResolvedValue(null)
    const logger = new InMemoryLogger()
    gateway = new FirebaseAuthGateway(logger)
  })

  type FirebaseAuthErrorCase = {
    code: string
    expected: string
    method: AuthMethod
  }

  describe('Firebase Auth Error Messages', () => {
    it.each<FirebaseAuthErrorCase>([
      {
        code: 'auth/email-already-in-use',
        expected: 'Invalid email or password.',
        method: AuthMethod.SignUpWithEmail,
      },
      {
        code: 'auth/invalid-email',
        expected: 'Invalid email address.',
        method: AuthMethod.SignInWithEmail,
      },
      {
        code: 'auth/weak-password',
        expected: 'Password must be at least 6 characters.',
        method: AuthMethod.SignUpWithEmail,
      },
      {
        code: 'auth/invalid-credential',
        expected: 'Invalid email or password.',
        method: AuthMethod.SignInWithEmail,
      },
      {
        code: 'auth/popup-closed-by-user',
        expected: 'Sign-in cancelled.',
        method: AuthMethod.SignInWithEmail,
      },
      {
        code: 'auth/cancelled-popup-request',
        expected: 'Sign-in cancelled.',
        method: AuthMethod.SignInWithEmail,
      },
    ])(
      'should translate $code to "$expected"',
      async ({ code, expected, method }) => {
        const mockError = new FirebaseError(code, `Firebase: Error (${code}).`)

        const authMethod =
          method === AuthMethod.SignUpWithEmail
            ? firebaseAuth.createUserWithEmailAndPassword
            : firebaseAuth.signInWithEmailAndPassword

        vi.mocked(authMethod).mockRejectedValue(mockError)

        const promise = gateway[method]('test@example.com', 'password123')

        await expect(promise).rejects.toThrow(expected)
      },
    )

    it('should return original Firebase error message for unknown error codes', async () => {
      const mockError = new FirebaseError(
        'auth/unknown-error',
        'Some unknown Firebase error',
      )

      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue(
        mockError,
      )

      const promise = gateway.signInWithEmail('test@example.com', 'password123')

      await expect(promise).rejects.toThrow('Some unknown Firebase error')
    })
  })

  describe('Google Sign-In Error Messages', () => {
    type GoogleSignInErrorCase = {
      pattern: string
      errorMessage: string
      expected: string
    }

    describe('errors from GoogleSignin.signIn', () => {
      it.each<GoogleSignInErrorCase>([
        {
          pattern: 'SIGN_IN_CANCELLED',
          errorMessage: 'User cancelled the sign-in flow SIGN_IN_CANCELLED',
          expected: 'Google sign-in was cancelled.',
        },
        {
          pattern: 'IN_PROGRESS',
          errorMessage: 'Sign-in operation is IN_PROGRESS',
          expected: 'Sign-in already in progress.',
        },
      ])(
        'should translate $pattern to "$expected"',
        async ({ errorMessage, expected }) => {
          const mockError = new Error(errorMessage)

          vi.mocked(GoogleSignin.hasPlayServices).mockResolvedValue(true)
          vi.mocked(GoogleSignin.signIn).mockRejectedValue(mockError)

          const promise = gateway.signInWithGoogle()

          await expect(promise).rejects.toThrow(expected)
        },
      )
    })

    describe('errors from GoogleSignin.hasPlayServices', () => {
      it('should translate PLAY_SERVICES_NOT_AVAILABLE error', async () => {
        const mockError = new Error(
          'Google Play Services PLAY_SERVICES_NOT_AVAILABLE',
        )

        vi.mocked(GoogleSignin.hasPlayServices).mockRejectedValue(mockError)

        const promise = gateway.signInWithGoogle()

        await expect(promise).rejects.toThrow(
          'Google Play Services not available.',
        )
      })
    })

    it('should return original error message for unknown Google errors', async () => {
      const mockError = new Error('Some unknown Google error')

      vi.mocked(GoogleSignin.hasPlayServices).mockResolvedValue(true)
      vi.mocked(GoogleSignin.signIn).mockRejectedValue(mockError)

      const promise = gateway.signInWithGoogle()

      await expect(promise).rejects.toThrow('Some unknown Google error')
    })
  })

  describe('Generic Error Handling', () => {
    it('should handle unknown error types', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue(
        'some string error',
      )

      const promise = gateway.signInWithEmail('test@example.com', 'password123')

      await expect(promise).rejects.toThrow('Unknown error occurred.')
    })
  })

  describe('logOut', () => {
    it('signs out of Google before Firebase when Google session exists', async () => {
      vi.mocked(GoogleSignin.isSignedIn).mockResolvedValue(true)

      await gateway.logOut()

      expect(GoogleSignin.isSignedIn).toHaveBeenCalledTimes(1)
      expect(GoogleSignin.signOut).toHaveBeenCalledTimes(1)
      expect(firebaseAuth.signOut).toHaveBeenCalledTimes(1)
    })

    it('skips Google sign out when no Google session exists', async () => {
      vi.mocked(GoogleSignin.isSignedIn).mockResolvedValue(false)

      await gateway.logOut()

      expect(GoogleSignin.signOut).not.toHaveBeenCalled()
      expect(firebaseAuth.signOut).toHaveBeenCalledTimes(1)
    })
  })
})
