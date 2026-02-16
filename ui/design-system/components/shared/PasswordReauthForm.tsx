import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { selectReauthStatus } from '@/core/auth/selectors/selectReauthStatus'
import { reauthenticate } from '@/core/auth/usecases/reauthenticate.usecase'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'

type PasswordReauthFormProps = Readonly<{
  onSuccess: () => void
}>

export function PasswordReauthForm({ onSuccess }: PasswordReauthFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { isReauthenticating } = useSelector(selectReauthStatus)
  const [password, setPassword] = useState('')

  const handlePasswordConfirm = async () => {
    const result = await dispatch(reauthenticate({ password }))
    if (reauthenticate.fulfilled.match(result)) {
      setPassword('')
      onSuccess()
    }
  }

  return (
    <>
      <Text style={styles.description}>
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
          onPress={handlePasswordConfirm}
          text="Confirm"
          isDisabled={isReauthenticating || password.length === 0}
        />
      </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: T.layout.width.full,
    marginTop: T.spacing.medium,
  },
})
