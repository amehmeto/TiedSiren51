import { useEffect, useState } from 'react'
import { AppStore, createStore } from '@/core/_redux_/createStore'
import { dependencies } from '@/ui/dependencies'
import { handleUIError } from '@/ui/utils/handleUIError'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'

export function useAppInitialization() {
  const [store, setStore] = useState<AppStore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        await dependencies.databaseService.initialize()

        const store = createStore(dependencies)

        if (isMounted) {
          setStore(store)
          store.dispatch(loadUser())
          setError(null)
        }
      } catch (initError: unknown) {
        const errorMessage = handleUIError(
          initError,
          'App initialization failed',
        )
        if (isMounted) setError(errorMessage)
      } finally {
        if (isMounted) setIsInitializing(false)
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [])

  return { store, error, isInitializing }
}
