import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { createStore } from '@/core/_redux_/createStore'
import { AppWithInitialization } from '@/ui/AppWithInitialization'
import { dependencies } from '@/ui/dependencies'
import { LoadingScreen } from '@/ui/design-system/components/shared/LoadingScreen'

SplashScreen.preventAutoHideAsync()

const store = createStore(dependencies)

export default function App() {
  const [isFontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  useEffect(() => {
    if (isFontsLoaded) SplashScreen.hideAsync()
  }, [isFontsLoaded])

  if (!isFontsLoaded) return <LoadingScreen />

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppWithInitialization store={store} />
      </Provider>
    </SafeAreaProvider>
  )
}
