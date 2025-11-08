import { Dependencies } from '@/core/_zustand_/dependencies'
import { AuthState, AuthStore, createAuthStore } from '@/core/auth/auth.store'

export type PreloadedState = {
  auth?: Partial<AuthState>
}

export type AppStore = {
  useAuthStore: ReturnType<typeof createAuthStore>
  getState: () => {
    auth: AuthStore
  }
}

export const createStore = (
  dependencies: Dependencies,
  preloadedState?: PreloadedState,
): AppStore => {
  const useAuthStore = createAuthStore(dependencies, preloadedState?.auth)

  const getState = () => ({
    auth: useAuthStore.getState(),
  })

  return {
    useAuthStore,
    getState,
  }
}
