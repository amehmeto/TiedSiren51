import { StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { reauthenticateWithGoogle } from '@/core/auth/usecases/reauthenticate-with-google.usecase'
import { reauthFormStyles } from '@/ui/design-system/components/shared/reauthFormStyles'
import {
  TiedSButton,
  TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSSocialButton } from '@/ui/design-system/components/shared/TiedSSocialButton'
import { T } from '@/ui/design-system/theme'

type GoogleReauthFormOwnProps = {
  onCancel: () => void
}

type GoogleReauthFormProps = Readonly<GoogleReauthFormOwnProps>

export function GoogleReauthForm({ onCancel }: GoogleReauthFormProps) {
  const dispatch = useDispatch<AppDispatch>()

  return (
    <>
      <Text style={reauthFormStyles.description}>
        Please sign in with Google to continue.
      </Text>
      <TiedSSocialButton
        iconName="logo-google"
        text="Sign in with Google"
        onPress={() => dispatch(reauthenticateWithGoogle())}
      />
      <View style={styles.buttonContainer}>
        <TiedSButton
          onPress={onCancel}
          text="Cancel"
          variant={TiedSButtonVariant.Secondary}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: T.layout.width.full,
    marginTop: T.spacing.medium,
  },
})
