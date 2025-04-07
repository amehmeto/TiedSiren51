import { useEffect, useState } from 'react'
import { AppStore } from '@/core/_redux_/createStore'
import { initializeApp } from '@/ui/initializeApp'
import { dependencies } from '@/ui/dependencies'
import { handleUIError } from '@/ui/utils/handleUIError'

export function useAppInitialization() {
  const [store, setStore] = useState<AppStore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let isMounted = true
    initializeApp(dependencies)
      .then((initializedStore: AppStore) => {
        if (isMounted) {
          setStore(initializedStore)
          setError(null)
        }
      })
      .catch((initError: unknown) => {
        const errorMessage = handleUIError(
          initError,
          'App initialization failed',
        )
        if (isMounted) setError(errorMessage)
      })
      .finally(() => {
        if (isMounted) setIsInitializing(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { store, error, isInitializing }
}
