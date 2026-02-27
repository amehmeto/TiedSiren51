import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { selectReauthStatus } from '@/core/auth/selectors/selectReauthStatus'
import { reauthenticate } from '@/core/auth/usecases/reauthenticate.usecase'
import { reauthFormStyles } from '@/ui/design-system/components/shared/reauthFormStyles'
import {
  TiedSButton,
  TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'

type PasswordReauthFormOwnProps = {
  onCancel: () => void
}

type PasswordReauthFormProps = Readonly<PasswordReauthFormOwnProps>

export function PasswordReauthForm({ onCancel }: PasswordReauthFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { isReauthenticating } = useSelector(selectReauthStatus)
  const [password, setPassword] = useState('')

  return (
    <>
      <Text style={reauthFormStyles.description}>
        Please enter your password to continue.
      </Text>
      <TiedSTextInput
        label="Password"
        hasPasswordToggle
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
      />
      <View style={styles.buttonContainer}>
        <TiedSButton
          style={styles.cancelButton}
          onPress={onCancel}
          text="Cancel"
          variant={TiedSButtonVariant.Secondary}
        />
        <TiedSButton
          onPress={() => dispatch(reauthenticate({ password }))}
          text="Confirm"
          isDisabled={isReauthenticating || password.length === 0}
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
  cancelButton: {
    marginRight: T.spacing.small,
  },
})
