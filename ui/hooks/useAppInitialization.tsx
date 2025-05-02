import { useLayoutEffect, useState } from 'react'
import { AppStore, createStore } from '@/core/_redux_/createStore'
import { dependencies } from '@/ui/dependencies'
import { handleUIError } from '@/ui/utils/handleUIError'
import { tieSirens } from '@/core/siren/usecases/tie-sirens.usecase'
import * as NavigationBar from 'expo-navigation-bar'
import { Platform } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'
import { setDispatch } from '@/infra/notification-service/expo.notification.service'
import { ExpoNotificationService } from '@/infra/notification-service/expo.notification.service'

export function useAppInitialization() {
  const [store, setStore] = useState<AppStore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const initializeServices = async (appStore: AppStore) => {
    try {
      await dependencies.databaseService.initialize()
      await dependencies.notificationService.initialize()
      await dependencies.backgroundTaskService.initialize(appStore)

      // Set the dispatch for notification service
      setDispatch(appStore.dispatch)

      // Set required dependencies for notification service
      const notificationService =
        dependencies.notificationService as ExpoNotificationService
      notificationService.setDependencies(
        dependencies.dateProvider,
        dependencies.blockSessionRepository,
      )

      // Start session monitoring
      notificationService.startSessionStatusMonitoring()

      await appStore.dispatch(tieSirens())
      await appStore.dispatch(loadUser())

      const state = appStore.getState()
      setIsAuthenticated(state.auth?.authUser !== null)

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
        const appStore = createStore(dependencies)
        if (!isMounted) return

        setStore(appStore)
        await initializeServices(appStore)
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
  }, [])

  return { store, error, isInitializing, isAuthenticated }
}
