import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import { useFonts } from 'expo-font'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { createStore } from '@/core/_redux_/createStore'
import { AppWithInitialization } from '@/ui/AppWithInitialization'
import { dependencies } from '@/ui/dependencies'

const store = createStore(dependencies)

export default function RootLayout() {
  const [isFontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  if (!isFontsLoaded) return null

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppWithInitialization store={store} />
      </Provider>
    </SafeAreaProvider>
  )
}
