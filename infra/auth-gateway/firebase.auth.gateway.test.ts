import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { FirebaseError } from 'firebase/app'
import * as firebaseAuth from 'firebase/auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FirebaseAuthGateway } from './firebase.auth.gateway'

vi.mock('firebase/app', () => {
  // Mock FirebaseError class for instanceof checks
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
    gateway = new FirebaseAuthGateway()
  })

  describe('Firebase Auth Error Messages', () => {
    it.each<{
      code: string
      expected: string
      method: 'signInWithEmail' | 'signUpWithEmail'
    }>([
      {
        code: 'auth/email-already-in-use',
        expected: 'This email is already in use.',
        method: 'signUpWithEmail',
      },
      {
        code: 'auth/invalid-email',
        expected: 'Invalid email address.',
        method: 'signInWithEmail',
      },
      {
        code: 'auth/weak-password',
        expected: 'Password must be at least 6 characters.',
        method: 'signUpWithEmail',
      },
      {
        code: 'auth/invalid-credential',
        expected: 'Invalid email or password.',
        method: 'signInWithEmail',
      },
      {
        code: 'auth/popup-closed-by-user',
        expected: 'Sign-in cancelled.',
        method: 'signInWithEmail',
      },
      {
        code: 'auth/cancelled-popup-request',
        expected: 'Sign-in cancelled.',
        method: 'signInWithEmail',
      },
    ])(
      'should translate $code to "$expected"',
      async ({ code, expected, method }) => {
        const mockError = new FirebaseError(code, `Firebase: Error (${code}).`)

        const authMethod =
          method === 'signUpWithEmail'
            ? firebaseAuth.createUserWithEmailAndPassword
            : firebaseAuth.signInWithEmailAndPassword

        vi.mocked(authMethod).mockRejectedValue(mockError)

        await expect(
          gateway[method as 'signInWithEmail' | 'signUpWithEmail'](
            'test@example.com',
            'password123',
          ),
        ).rejects.toThrow(expected)
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

      await expect(
        gateway.signInWithEmail('test@example.com', 'password123'),
      ).rejects.toThrow('Some unknown Firebase error')
    })
  })

  describe('Google Sign-In Error Messages', () => {
    describe('errors from GoogleSignin.signIn', () => {
      it.each<{
        pattern: string
        errorMessage: string
        expected: string
      }>([
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

          await expect(gateway.signInWithGoogle()).rejects.toThrow(expected)
        },
      )
    })

    describe('errors from GoogleSignin.hasPlayServices', () => {
      it('should translate PLAY_SERVICES_NOT_AVAILABLE error', async () => {
        const mockError = new Error(
          'Google Play Services PLAY_SERVICES_NOT_AVAILABLE',
        )

        vi.mocked(GoogleSignin.hasPlayServices).mockRejectedValue(mockError)

        await expect(gateway.signInWithGoogle()).rejects.toThrow(
          'Google Play Services not available.',
        )
      })
    })

    it('should return original error message for unknown Google errors', async () => {
      const mockError = new Error('Some unknown Google error')

      vi.mocked(GoogleSignin.hasPlayServices).mockResolvedValue(true)
      vi.mocked(GoogleSignin.signIn).mockRejectedValue(mockError)

      await expect(gateway.signInWithGoogle()).rejects.toThrow(
        'Some unknown Google error',
      )
    })
  })

  describe('Generic Error Handling', () => {
    it('should handle unknown error types', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue(
        'some string error',
      )

      await expect(
        gateway.signInWithEmail('test@example.com', 'password123'),
      ).rejects.toThrow('Unknown error occurred.')
    })
  })
})
