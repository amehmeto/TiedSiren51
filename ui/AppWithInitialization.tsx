import { Stack, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { MenuProvider } from 'react-native-popup-menu'
import { AppStore } from '@/core/_redux_/createStore'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { TiedSToast } from '@/ui/design-system/components/shared/TiedSToast'
import { useAppInitialization } from '@/ui/hooks/useAppInitialization'
import { useEmailVerificationDeepLink } from '@/ui/hooks/useEmailVerificationDeepLink'
import { usePasswordResetDeepLink } from '@/ui/hooks/usePasswordResetDeepLink'

type AppWithInitializationProps = {
  store: AppStore
  isFontsLoaded: boolean
}

const routes = [
  '(auth)/register',
  '(auth)/login',
  '(auth)/signup',
  '(auth)/forgot-password',
  '(auth)/reset-password-confirm',
  '(tabs)',
]

export function AppWithInitialization({
  store,
  isFontsLoaded,
}: AppWithInitializationProps) {
  const { isInitializing, isAuthenticated } = useAppInitialization(store)
  const router = useRouter()
  usePasswordResetDeepLink()
  useEmailVerificationDeepLink()

  const isReady = isFontsLoaded && !isInitializing

  useEffect(() => {
    if (!isReady) return
    SplashScreen.hideAsync()
    if (router.canDismiss()) router.dismissAll()
    router.replace(isAuthenticated ? '/home' : '/register')
  }, [isReady, isAuthenticated, router])

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
      <TiedSToast />
    </MenuProvider>
  )
}
