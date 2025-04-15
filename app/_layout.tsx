import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { MenuProvider } from 'react-native-popup-menu'
import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAppInitialization } from '@/ui/hooks/useAppInitialization'

export default function App() {
  const { store, error, isInitializing } = useAppInitialization()
  const router = useRouter()
  // TODO: should be retrieved from the store
  const isAuthenticated = false

  useEffect(() => {
    if (isInitializing || !store) return
    router.replace(isAuthenticated ? '/home' : '/register')
  }, [store, isInitializing, isAuthenticated, router])

  if (isInitializing || !store) {
    return (
      <SafeAreaProvider>
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
      </SafeAreaProvider>
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
    <SafeAreaProvider>
      <Provider store={store}>
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
      </Provider>
    </SafeAreaProvider>
  )
}
