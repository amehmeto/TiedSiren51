import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import 'react-native-reanimated'
import { useColorScheme } from '@/app-view/hooks/useColorScheme'
import * as Notifications from 'expo-notifications'
import { AppStore } from '@/core/_redux_/createStore'
import { Platform } from 'react-native'
import { storePromise } from '@/app-view/preloadedStateForManualTesting'
import * as NavigationBar from 'expo-navigation-bar'
import { T } from '@/app-view/design-system/theme'
import { RealBackgroundTaskService } from '@/infra/background-task-service/real.background-task.service'
import { tieSirens } from '@/core/siren/usecases/tie-sirens.usecase'
import { dependencies } from '@/app-view/dependencies'
import { Provider } from 'react-redux'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  const [store, setStore] = useState<AppStore | null>(null)

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

  if (!store) return null

  store.dispatch(tieSirens())
  ;(dependencies.backgroundTaskService as RealBackgroundTaskService)
    .initialize(store)
    // eslint-disable-next-line no-console
    .then(() => console.log('task service initialised'))

  if (!loaded) return null

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </Provider>
  )
}
