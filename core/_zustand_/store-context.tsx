import { createContext, useContext, type ReactNode } from 'react'
import { AppStore } from '@/core/_zustand_/createStore'
import { AuthStore } from '@/core/auth/auth.store'

const StoreContext = createContext<AppStore | null>(null)

export const StoreProvider = ({
  store,
  children,
}: {
  store: AppStore
  children: ReactNode
}) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

const useStoreContext = () => {
  const store = useContext(StoreContext)

  if (!store) {
    throw new Error('useStoreContext must be used within a StoreProvider')
  }

  return store
}

export const useStore = () => useStoreContext()

export const useAuthStoreApi = () => useStoreContext().useAuthStore

export function useAuthStore(): AuthStore
export function useAuthStore<T>(selector: (state: AuthStore) => T): T
export function useAuthStore<T>(
  selector?: (state: AuthStore) => T,
): T | AuthStore {
  const store = useStoreContext().useAuthStore

  if (!selector) {
    return store()
  }

  return store(selector)
}
