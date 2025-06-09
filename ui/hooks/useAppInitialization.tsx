import { useLayoutEffect, useState } from 'react'
import { AppStore } from '@/core/_redux_/createStore'
import { dependencies } from '@/ui/dependencies'
import { handleUIError } from '@/ui/utils/handleUIError'
import { tieSirens } from '@/core/siren/usecases/tie-sirens.usecase'
import * as NavigationBar from 'expo-navigation-bar'
import { Platform } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'
import { selectIsUserAuthenticated } from '@/core/auth/selectors/selectIsUserAuthenticated'

export function useAppInitialization(store: AppStore) {
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const initializeServices = async (appStore: AppStore) => {
    try {
      await dependencies.databaseService.initialize()
      await dependencies.notificationService.initialize()
      await dependencies.backgroundTaskService.initialize(appStore)

      await appStore.dispatch(tieSirens())
      await appStore.dispatch(loadUser())

      if (Platform.OS === 'android') {
        await NavigationBar.setBackgroundColorAsync(T.color.darkBlue).catch(
          (error) => {
            handleUIError(error, 'Navigation bar color setting failed')
          },
        )
      }

      setError(null)
    } catch (error) {
      const errorMessage = handleUIError(error, 'Service initialization failed')
      setError(errorMessage)
    } finally {
      setIsInitializing(false)
    }
  }

  useLayoutEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        await initializeServices(store)
        if (!isMounted) return
        setError(null)
      } catch (error) {
        if (!isMounted) return
        const errorMessage = handleUIError(error, 'Store creation failed')
        setError(errorMessage)
        setIsInitializing(false)
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [store])

  const isAuthenticated = selectIsUserAuthenticated(store.getState())

  return { error, isInitializing, isAuthenticated }
}
