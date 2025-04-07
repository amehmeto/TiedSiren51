import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { MenuProvider } from 'react-native-popup-menu'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import { AppStore } from '@/core/_redux_/createStore'
import { tieSirens } from '@/core/siren/usecases/tie-sirens.usecase'
import { dependencies } from '@/ui/dependencies'
import * as NavigationBar from 'expo-navigation-bar'
import { Platform, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { Stack, useRouter } from 'expo-router'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { initializeApp } from '@/ui/initializeApp'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

const handleUIError = (error: unknown, context: string) => {
  return `${context}: ${error instanceof Error ? error.message : String(error)}`
}

function useAppInitialization() {
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

export default function App() {
  const { store, error, isInitializing } = useAppInitialization()
  const router = useRouter()
  // TODO: should be retrieve from the store
  const isAuthenticated = false

  useEffect(() => {
    if (!store) return

    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(T.color.darkBlue).catch((error) =>
        handleUIError(error, 'Navigation bar color setting failed'),
      )
    }

    store.dispatch(tieSirens())
    dependencies.backgroundTaskService
      .initialize(store)
      .catch((error) =>
        handleUIError(error, 'Background task initialization failed'),
      )
  }, [store])

  useEffect(() => {
    if (!store || isInitializing) return

    router.replace(isAuthenticated ? '/home' : '/register')
  }, [store, isInitializing, isAuthenticated, router])

  if (isInitializing || !store) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#1e293b',
          }}
        >
          <Text style={{ color: 'white', fontSize: 18 }}>
            {isInitializing
              ? 'Loading...'
              : error
                ? `Error: ${error}`
                : 'Initializing...'}
          </Text>
        </View>
      </SafeAreaProvider>
    )
  }

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
                    header: () => null,
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
