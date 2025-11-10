import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MenuProvider } from 'react-native-popup-menu'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { createStore } from '@/core/_redux_/createStore'
import { dependencies } from '@/ui/dependencies'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { useAppInitialization } from '@/ui/hooks/useAppInitialization'
import { T } from '@ui/design-system/theme'

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
      <View style={styles.view}>
        <Text style={styles.text}>
          {/* eslint-disable-next-line no-nested-ternary */}
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

const styles = StyleSheet.create({
  text: {
    color: T.color.white,
    fontSize: 18,
  },
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: T.color.darkBlueGray,
  },
})
