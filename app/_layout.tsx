import { useEffect } from 'react'
import { MenuProvider } from 'react-native-popup-menu'
import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAppInitialization } from '@/ui/hooks/useAppInitialization'
import { Provider } from 'react-redux'
import {
  createStore as createReduxStore,
  type RootState,
} from '@/core/_redux_/createStore'
import { dependencies } from '@/ui/dependencies'
import { StoreProvider, useAuthStoreApi } from '@/core/_zustand_/store-context'
import { createStore as createZustandStore } from '@/core/_zustand_/createStore'

const reduxStore = createReduxStore(dependencies)
const zustandStore = createZustandStore(dependencies)

const syncAuthStateToZustand = (
  authStoreApi: typeof zustandStore.useAuthStore,
  authState: RootState['auth'],
) => {
  const { authUser, error, isLoading } = authState
  const currentState = authStoreApi.getState()

  if (
    currentState.authUser === authUser &&
    currentState.error === error &&
    currentState.isLoading === isLoading
  ) {
    return
  }

  authStoreApi.setState(
    {
      authUser,
      error,
      isLoading,
    },
    false,
  )
}

const useSyncReduxAuthToZustand = () => {
  const authStoreApi = useAuthStoreApi()

  useEffect(() => {
    const sync = () =>
      syncAuthStateToZustand(authStoreApi, reduxStore.getState().auth)

    sync()
    const unsubscribe = reduxStore.subscribe(sync)
    return () => {
      unsubscribe()
    }
  }, [authStoreApi])
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider store={zustandStore}>
        <Provider store={reduxStore}>
          <AppWithInitialization />
        </Provider>
      </StoreProvider>
    </SafeAreaProvider>
  )
}

function AppWithInitialization() {
  useSyncReduxAuthToZustand()
  const { error, isInitializing, isAuthenticated } =
    useAppInitialization(reduxStore)
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
