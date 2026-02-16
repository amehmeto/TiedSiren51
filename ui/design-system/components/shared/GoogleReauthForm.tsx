import { StyleSheet, Text } from 'react-native'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { reauthenticateWithGoogle } from '@/core/auth/usecases/reauthenticate-with-google.usecase'
import { TiedSSocialButton } from '@/ui/design-system/components/shared/TiedSSocialButton'
import { T } from '@/ui/design-system/theme'

type GoogleReauthFormProps = Readonly<{
  onSuccess: () => void
}>

export function GoogleReauthForm({ onSuccess }: GoogleReauthFormProps) {
  const dispatch = useDispatch<AppDispatch>()

  const handleGoogleConfirm = async () => {
    const result = await dispatch(reauthenticateWithGoogle())
    if (reauthenticateWithGoogle.fulfilled.match(result)) onSuccess()
  }

  return (
    <>
      <Text style={styles.description}>
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

const styles = StyleSheet.create({
  description: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    textAlign: 'center',
    marginBottom: T.spacing.medium,
  },
})
