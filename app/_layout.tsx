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

export default function App() {
  const [store, setStore] = useState<AppStore | null>(null)
  const [dbInitialized, setDbInitialized] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const router = useRouter()
  const isAuthenticated = false

  // Separate DB initialization effect
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDb()
        setDbInitialized(true)
        const newStore = await storePromise

        // Load existing blocklists into store
        const blocklistRepository = new PrismaBlocklistRepository()
        const blocklists = await blocklistRepository.findAll()

        // Dispatch using the correct action
        newStore.dispatch(setBlocklists(blocklists))
        console.log('Dispatching blocklists:', blocklists)

        setStore(newStore)
        configureNavigationBar()
      } catch (error) {
        console.error('Initialization error:', error)
      }
    }
    initialize()

    return () => {
      closeDb().catch(console.error)
    }
  }, [])

  // Refresh subscriptions effect
  useEffect(() => {
    if (!dbInitialized) return

    let timeoutId: NodeJS.Timeout
    let isActive = true

    const refresh = async () => {
      if (!isActive) return
      try {
        await extendedClient.$refreshSubscriptions()
        setRefreshKey((prev) => prev + 1)
        timeoutId = setTimeout(refresh, 1000)
      } catch (error) {
        console.error('Refresh error:', error)
      }
    }

    refresh()

    return () => {
      isActive = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [dbInitialized])

  useEffect(() => {
    if (!store) return
    initializeBackgroundTasks(store)
    navigateBasedOnAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, isAuthenticated])

  function navigateBasedOnAuth() {
    router.replace(isAuthenticated ? '/home' : '/register')
  }

  function configureNavigationBar() {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(T.color.darkBlue).catch(handleError)
    }
  }

  async function initializeBackgroundTasks(store: AppStore) {
    try {
      store.dispatch(tieSirens())
      await dependencies.backgroundTaskService.initialize(store)
    } catch (error) {
      const parsedError =
        error instanceof Error ? error : new Error(String(error))
      handleError(parsedError)
    }
  }

  function handleError(error: Error) {
    // eslint-disable-next-line no-console
    console.error('Error:', error)
  }

  // Don't render anything until DB is initialized
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
