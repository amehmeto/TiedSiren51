import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { MenuProvider } from 'react-native-popup-menu'
import { AppStore } from '@/core/_redux_/createStore'
import { InitializingView } from '@/ui/design-system/components/shared/InitializingView'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { ToastProvider } from '@/ui/design-system/context/ToastContext'
import { useAppInitialization } from '@/ui/hooks/useAppInitialization'

type AppWithInitializationProps = Readonly<{
  store: AppStore
}>

export function AppWithInitialization({ store }: AppWithInitializationProps) {
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
      <ToastProvider>
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
      </ToastProvider>
    </MenuProvider>
  )
}
