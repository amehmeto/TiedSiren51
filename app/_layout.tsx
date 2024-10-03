import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { MenuProvider } from 'react-native-popup-menu'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import { AppStore } from '@/core/_redux_/createStore'
import { storePromise } from '@/ui/preloadedStateForManualTesting'
import { tieSirens } from '@/core/siren/usecases/tie-sirens.usecase'
import { RealBackgroundTaskService } from '@/infra/background-task-service/real.background-task.service'
import { dependencies } from '@/ui/dependencies'
import * as NavigationBar from 'expo-navigation-bar'
import { Platform } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { Stack, useRouter } from 'expo-router'

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
    if (store) {
      initializeBackgroundTasks(store)
      navigateBasedOnAuth()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, isAuthenticated])

  const initializeStore = () => {
    storePromise.then(setStore)
  }

  const configureNavigationBar = () => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(T.color.darkBlue).catch(handleError)
    }
  }

  const initializeBackgroundTasks = async (store: AppStore) => {
    store.dispatch(tieSirens())
    try {
      await (
        dependencies.backgroundTaskService as RealBackgroundTaskService
      ).initialize(store)
      console.log('Background task service initialized')
    } catch (error) {
      handleError(error)
    }
  }

  const navigateBasedOnAuth = () => {
    router.replace(isAuthenticated ? '/home' : '/register')
  }

  const handleError = (error: unknown) => {
    console.error('Error:', error)
  }

  if (!store) return null

  return (
    <Provider store={store}>
      <MenuProvider>
        <StatusBar style={'auto'} />
        <Stack
          screenOptions={{
            header: () => null,
            contentStyle: { backgroundColor: T.color.white },
          }}
        >
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/signup" />
          <Stack.Screen name="(auth)/forgot-password" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </MenuProvider>
    </Provider>
  )
}
