import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { MenuProvider } from 'react-native-popup-menu'
import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAppInitialization } from '@/ui/hooks/useAppInitialization'
import { createStore } from '@/core/_redux_/createStore'
import { dependencies } from '@/ui/dependencies'

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

  if (isInitializing) {
    return (
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
