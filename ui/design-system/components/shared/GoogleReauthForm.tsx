import { Text } from 'react-native'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { reauthenticateWithGoogle } from '@/core/auth/usecases/reauthenticate-with-google.usecase'
import { reauthFormStyles } from '@/ui/design-system/components/shared/reauthFormStyles'
import { TiedSSocialButton } from '@/ui/design-system/components/shared/TiedSSocialButton'

type GoogleReauthFormProps = Readonly<{
  onSuccess: () => void
}>

export function GoogleReauthForm({ onSuccess }: GoogleReauthFormProps) {
  const dispatch = useDispatch<AppDispatch>()

  const handleGoogleConfirm = async () => {
    const reauthAction = await dispatch(reauthenticateWithGoogle())
    if (reauthenticateWithGoogle.fulfilled.match(reauthAction)) onSuccess()
  }

  return (
    <>
      <Text style={reauthFormStyles.description}>
        Please sign in with Google to continue.
      </Text>
      <TiedSSocialButton
        iconName="logo-google"
        text="Sign in with Google"
        onPress={handleGoogleConfirm}
      />
    </>
  )
}
