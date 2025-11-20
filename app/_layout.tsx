import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { MenuProvider } from 'react-native-popup-menu'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { createStore } from '@/core/_redux_/createStore'
import { dependencies } from '@/ui/dependencies'
import { InitializingView } from '@/ui/design-system/components/shared/InitializingView'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { useAppInitialization } from '@/ui/hooks/useAppInitialization'

const store = createStore(dependencies)

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppWithInitialization />
      </Provider>
    </SafeAreaProvider>
  )
}

function AppWithInitialization() {
  const { error, isInitializing, isAuthenticated } = useAppInitialization(store)
  const router = useRouter()

  useEffect(() => {
    if (isInitializing) return
    router.replace(isAuthenticated ? '/home' : '/register')
  }, [isInitializing, isAuthenticated, router])

  if (isInitializing)
    return <InitializingView isInitializing={isInitializing} error={error} />

  const routes = [
    '(auth)/register',
    '(auth)/login',
    '(auth)/signup',
    '(auth)/forgot-password',
    '(tabs)',
  ]

  return (
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
  )
}
