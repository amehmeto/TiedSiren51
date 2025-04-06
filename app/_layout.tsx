import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { MenuProvider } from 'react-native-popup-menu'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import { AppStore } from '@/core/_redux_/createStore'
import { storePromise } from '@/ui/preloadedStateForManualTesting'
import { tieSirens } from '@/core/siren/usecases/tie-sirens.usecase'
import { dependencies } from '@/ui/dependencies'
import * as NavigationBar from 'expo-navigation-bar'
import { Platform } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { Stack, useRouter } from 'expo-router'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  initializeDb,
  closeDb,
  extendedClient,
} from '@/infra/prisma/databaseService'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

const handleError = (error: unknown, context: string) => {
  if (__DEV__) {
    throw new Error(
      `${context}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDatabaseRefresh = (isActive: boolean, callback: () => void) => {
    if (!isActive) return

    extendedClient
      .$refreshSubscriptions()
      .then(() => {
        if (isActive) {
          setRefreshKey((prev) => prev + 1)
          callback()
        }
      })
      .catch((error) => {
        handleError(error, 'Database refresh failed')
        if (isActive) callback()
      })
  }

  useEffect(() => {
    let isMounted = true

    initializeDb()
      .then(() => {
        if (isMounted) setIsInitialized(true)
      })
      .catch((error) => {
        handleError(error, 'Database initialization failed')
      })

    return () => {
      isMounted = false
      closeDb()
    }
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    let timeoutId: NodeJS.Timeout
    let isActive = true

    const refreshSubscriptions = () => {
      handleDatabaseRefresh(isActive, () => {
        timeoutId = setTimeout(refreshSubscriptions, 1000)
      })
    }

    refreshSubscriptions()

    return () => {
      isActive = false
      clearTimeout(timeoutId)
    }
  }, [isInitialized])

  return { isInitialized, refreshKey }
}

function useStoreInitialization() {
  const [store, setStore] = useState<AppStore | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    storePromise
      .then(async (newStore) => {
        await newStore.dispatch(loadUser()).unwrap()
        return newStore
      })
      .then((initializedStore) => {
        if (isMounted) setStore(initializedStore)
      })
      .catch((error) => {
        handleError(error, 'Store initialization failed')
        if (isMounted) {
          setError(error instanceof Error ? error : new Error(String(error)))
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { store, error }
}

const commonStackScreenOptions = {
  header: () => null,
  contentStyle: { backgroundColor: 'transparent' },
}

export default function App() {
  // TODO: useDatabase(), shouldn't exist. That should happen when instanciating a Prisma repo.
  // It means you need to create an abstract class on Prisma repos that would inherit this initialized methods and state
  const { isInitialized: dbInitialized } = useDatabase()
  const { store } = useStoreInitialization()
  const router = useRouter()
  // TODO: should be retrieve from the store
  const isAuthenticated = false

  useEffect(() => {
    if (!store) return

    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(T.color.darkBlue).catch((error) =>
        handleError(error, 'Navigation bar color setting failed'),
      )
    }

    store.dispatch(tieSirens())
    dependencies.backgroundTaskService
      .initialize(store)
      .catch((error) =>
        handleError(error, 'Background task initialization failed'),
      )
  }, [store])

  // TODO: this useEffect might not be necessary. Be frugal on the use of useEffect. It has some performance costs.
  // If you can avoid using it, the better
  useEffect(() => {
    if (!store || !dbInitialized) return

    // TODO: shouldn't need setTimeout. To be removed
    const timeoutId = setTimeout(() => {
      router.replace(isAuthenticated ? '/home' : '/register')
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [store, dbInitialized, isAuthenticated, router])

  if (!dbInitialized || !store) return null

  const routes = [
    '(auth)/register',
    '(auth)/login',
    '(auth)/signup',
    '(auth)/forgot-password',
    '(tabs)',
  ]

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <MenuProvider>
          <StatusBar style={'auto'} />
          <TiedSLinearBackground>
            <Stack screenOptions={commonStackScreenOptions}>
              {routes.map((route) => (
                <Stack.Screen
                  key={route}
                  name={route}
                  options={commonStackScreenOptions}
                />
              ))}
            </Stack>
          </TiedSLinearBackground>
        </MenuProvider>
      </Provider>
    </SafeAreaProvider>
  )
}
