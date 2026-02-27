import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { MenuProvider } from 'react-native-popup-menu'
import { AppStore } from '@/core/_redux_/createStore'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { TiedSToast } from '@/ui/design-system/components/shared/TiedSToast'
import { useAppInitialization } from '@/ui/hooks/useAppInitialization'
import { useEmailVerificationDeepLink } from '@/ui/hooks/useEmailVerificationDeepLink'
import { usePasswordResetDeepLink } from '@/ui/hooks/usePasswordResetDeepLink'

type AppWithInitializationProps = {
  store: AppStore
}

const routes = [
  '(auth)/register',
  '(auth)/login',
  '(auth)/signup',
  '(auth)/forgot-password',
  '(auth)/reset-password-confirm',
  '(tabs)',
]

export function AppWithInitialization({ store }: AppWithInitializationProps) {
  useAppInitialization(store)
  usePasswordResetDeepLink()
  useEmailVerificationDeepLink()

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
