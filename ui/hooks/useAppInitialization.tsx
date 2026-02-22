import * as NavigationBar from 'expo-navigation-bar'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppStore } from '@/core/_redux_/createStore'
import { loadAccessibilityConsent } from '@/core/accessibility-consent/usecases/load-accessibility-consent.usecase'
import { selectIsUserAuthenticated } from '@/core/auth/selectors/selectIsUserAuthenticated'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'
import { loadFeatureFlags } from '@/core/feature-flag/usecases/load-feature-flags.usecase'
import { dependencies } from '@/ui/dependencies'
import { T } from '@/ui/design-system/theme'
import { handleUIError } from '@/ui/utils/handleUIError'

export function useAppInitialization(store: AppStore) {
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const dispatch = useDispatch<AppDispatch>()

  const initializeServices = async () => {
    try {
      const { logger, sirenTier } = dependencies
      logger.initialize()
      await dependencies.databaseService.initialize()
      await dependencies.notificationService.initialize()
      await dependencies.backgroundTaskService.initialize(store)
      await sirenTier.initializeNativeBlocking()

      await dispatch(loadFeatureFlags())
      await dispatch(loadAccessibilityConsent())
      await dispatch(loadUser())

      if (Platform.OS === 'android') {
        await NavigationBar.setBackgroundColorAsync(T.color.darkBlue).catch(
          (error) => {
            handleUIError(error, 'Navigation bar color setting failed')
          },
        )
      }

      logger.info('[useAppInitialization] App initialization complete')
      setError(null)
    } catch (error) {
      dependencies.logger.error(`[useAppInitialization] Error: ${error}`)
      const errorMessage = handleUIError(error, 'Service initialization failed')
      setError(errorMessage)
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        await initializeServices()
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
  }, [dispatch, store])

  const isAuthenticated = useSelector(selectIsUserAuthenticated)

  return { error, isInitializing, isAuthenticated }
}
