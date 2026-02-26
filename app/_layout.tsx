import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import * as Sentry from '@sentry/react-native'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { createStore } from '@/core/_redux_/createStore'
import { AppWithInitialization } from '@/ui/AppWithInitialization'
import { dependencies } from '@/ui/dependencies'

SplashScreen.preventAutoHideAsync()

const store = createStore(dependencies)

function RootLayout() {
  const [isFontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppWithInitialization store={store} isFontsLoaded={isFontsLoaded} />
      </Provider>
    </SafeAreaProvider>
  )
}

export default Sentry.wrap(RootLayout)
