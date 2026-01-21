import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { createStore } from '@/core/_redux_/createStore'
import { AppWithInitialization } from '@/ui/AppWithInitialization'
import { dependencies } from '@/ui/dependencies'

const store = createStore(dependencies)

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppWithInitialization store={store} />
      </Provider>
    </SafeAreaProvider>
  )
}
