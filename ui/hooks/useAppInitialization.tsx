import { useEffect, useState } from 'react'
import { AppStore } from '@/core/_redux_/createStore'
import { initializeApp } from '@/ui/initializeApp'
import { dependencies } from '@/ui/dependencies'
import { handleUIError } from '@/ui/utils/handleUIError'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

export function useAppInitialization() {
  const [store, setStore] = useState<AppStore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        const dbDir =
          Platform.OS === 'android'
            ? `${FileSystem.documentDirectory}databases`
            : `${FileSystem.documentDirectory}SQLite`

        const dirInfo = await FileSystem.getInfoAsync(dbDir)

        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true })
        }

        const initializedStore = await initializeApp(dependencies)

        if (isMounted) {
          setStore(initializedStore)
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
