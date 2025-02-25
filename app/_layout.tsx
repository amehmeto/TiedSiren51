/* eslint-disable no-console */
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
import { initializeDb, closeDb, extendedClient } from '@/myDbModule'
import { PrismaBlocklistRepository } from '@/infra/blocklist-repository/prisma.blocklist.repository'
import { setBlocklists } from '@/core/blocklist/blocklist.slice'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

// Custom hook for database initialization
function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDb()
        setIsInitialized(true)
      } catch (error) {
        console.error('Database initialization error:', error)
      }
    }
    initialize()

    return () => {
      closeDb().catch(console.error)
    }
  }, [])

  // Subscription refresh logic
  useEffect(() => {
    if (!isInitialized) return

    let timeoutId: NodeJS.Timeout
    let isActive = true

    const refresh = async () => {
      if (!isActive) return
      try {
        await extendedClient.$refreshSubscriptions()
        setRefreshKey((prev) => prev + 1)
        timeoutId = setTimeout(refresh, 1000)
      } catch (error) {
        console.error('Subscription refresh error:', error)
      }
    }

    refresh()

    return () => {
      isActive = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isInitialized])

  return { isInitialized, refreshKey }
}

// Custom hook for store initialization
function useStoreInitialization() {
  const [store, setStore] = useState<AppStore | null>(null)

  useEffect(() => {
    const initializeStore = async () => {
      try {
        const newStore = await storePromise
        const blocklistRepository = new PrismaBlocklistRepository()
        const blocklists = await blocklistRepository.findAll()
        newStore.dispatch(setBlocklists(blocklists))
        setStore(newStore)
      } catch (error) {
        console.error('Store initialization error:', error)
      }
    }
    initializeStore()
  }, [])

  return store
}

export default function App() {
  const { isInitialized: dbInitialized } = useDatabase()
  const store = useStoreInitialization()
  const router = useRouter()
  const isAuthenticated = false

  // Split the initialization into two effects
  useEffect(() => {
    if (!store) return

    const initializeServices = async () => {
      try {
        // Configure navigation bar
        if (Platform.OS === 'android') {
          await NavigationBar.setBackgroundColorAsync(T.color.darkBlue)
        }

        // Initialize background tasks
        store.dispatch(tieSirens())
        await dependencies.backgroundTaskService.initialize(store)
      } catch (error) {
        console.error(
          'Service initialization error:',
          error instanceof Error ? error : String(error),
        )
      }
    }

    initializeServices()
  }, [store])

  // Separate navigation effect that runs after initialization
  useEffect(() => {
    if (!store || !dbInitialized) return

    // Small delay to ensure Root Layout is mounted
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
            <Stack
              screenOptions={{
                header: () => null,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            >
              {routes.map((route) => (
                <Stack.Screen
                  key={route}
                  name={route}
                  options={{
                    contentStyle: { backgroundColor: 'transparent' },
                  }}
                />
              ))}
            </Stack>
          </TiedSLinearBackground>
        </MenuProvider>
      </Provider>
    </SafeAreaProvider>
  )
}
