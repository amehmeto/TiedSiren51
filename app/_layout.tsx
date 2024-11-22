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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export default function App() {
  const [store, setStore] = useState<AppStore | null>(null)
  const router = useRouter()
  const isAuthenticated = false

  useEffect(() => {
    initializeStore()
    configureNavigationBar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!store) return
    initializeBackgroundTasks(store)
    navigateBasedOnAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, isAuthenticated])

  function navigateBasedOnAuth() {
    router.replace(isAuthenticated ? '/home' : '/register')
  }

  function initializeStore() {
    storePromise.then(setStore).catch(handleError)
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

  if (!store) return null

  const routes = [
    '(auth)/register',
    '(auth)/login',
    '(auth)/signup',
    '(auth)/forgot-password',
    '(tabs)',
  ]

  return (
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
              <Stack.Screen key={route} name={route} />
            ))}
          </Stack>
        </TiedSLinearBackground>
      </MenuProvider>
    </Provider>
  )
}
