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
import { Stack } from 'expo-router'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export default function App() {
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

  return (
    <Provider store={store}>
      <MenuProvider>
        <StatusBar style={'auto'} />
        <Stack
          screenOptions={{
            header: () => null,
            contentStyle: { backgroundColor: '#FFF' },
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
      </MenuProvider>
    </Provider>
  )
}
