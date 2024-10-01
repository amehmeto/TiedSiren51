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
  // const isAuthenticated = useSelector(selectIsAuthenticated)
  const router = useRouter()
  const isAuthenticated = false

  useEffect(() => {
    storePromise.then(setStore)
    if (Platform.OS === 'android')
      NavigationBar.setBackgroundColorAsync(T.color.darkBlue).catch(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: any) => {
          // eslint-disable-next-line no-console
          console.error('Failed to set navigation bar color', e)
        },
      )
  }, [])

  useEffect(() => {
    if (store) {
      store.dispatch(tieSirens())
      ;(dependencies.backgroundTaskService as RealBackgroundTaskService)
        .initialize(store)
        .then(() => console.log('task service initialized'))
      if (!isAuthenticated) {
        router.replace('/register')
      } else {
        router.replace('/home')
      }
    }
  }, [store, isAuthenticated])

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
