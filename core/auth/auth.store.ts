import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Dependencies } from '@/core/_zustand_/dependencies'
import { AuthUser } from '@/core/auth/authUser'
import { LoginCredentials, SignUpCredentials } from '@/core/auth/authTypes'
import { signInWithEmailCommand } from '@/core/auth/usecases/sign-in-with-email.usecase'
import { signUpWithEmailCommand } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { signInWithGoogleCommand } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { signInWithAppleCommand } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { logOutCommand } from '@/core/auth/usecases/log-out.usecase'

export type AuthState = {
  authUser: AuthUser | null
  isLoading: boolean
  error: string | null
}

export type AuthActions = {
  setAuthUser: (user: AuthUser | null) => void
  setError: (error: string | null) => void
  clearError: () => void
  clearAuthState: () => void
  signInWithEmail: (credentials: LoginCredentials) => Promise<void>
  signUpWithEmail: (credentials: SignUpCredentials) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  logOut: () => Promise<void>
}

export type AuthStore = AuthState & AuthActions

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export const createAuthStore = (
  dependencies: Dependencies,
  preloadedState?: Partial<AuthState>,
) => {
  const initialState: AuthState = {
    authUser: preloadedState?.authUser ?? null,
    isLoading: preloadedState?.isLoading ?? false,
    error: preloadedState?.error ?? null,
  }

  return create<AuthStore>()(
    subscribeWithSelector((set) => ({
      ...initialState,
      setAuthUser: (user) =>
        set({
          authUser: user,
          error: null,
          isLoading: false,
        }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      clearAuthState: () => set({ isLoading: false, error: null }),
      signInWithEmail: async (credentials) => {
        set({ isLoading: true, error: null })

        try {
          const user = await signInWithEmailCommand(dependencies, credentials)
          set({ authUser: user, isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Sign in failed'),
          })
        }
      },
      signUpWithEmail: async (credentials) => {
        set({ isLoading: true, error: null })

        try {
          const user = await signUpWithEmailCommand(dependencies, credentials)
          set({ authUser: user, isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Sign up failed'),
          })
        }
      },
      signInWithGoogle: async () => {
        set({ isLoading: true, error: null })

        try {
          const user = await signInWithGoogleCommand(dependencies)
          set({ authUser: user, isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Google sign in failed'),
          })
        }
      },
      signInWithApple: async () => {
        set({ isLoading: true, error: null })

        try {
          const user = await signInWithAppleCommand(dependencies)
          set({ authUser: user, isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Apple sign in failed'),
          })
        }
      },
      logOut: async () => {
        set({ isLoading: true, error: null })

        try {
          await logOutCommand(dependencies)
          set({ authUser: null, isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Logout failed'),
          })
        }
      },
    })),
  )
}
