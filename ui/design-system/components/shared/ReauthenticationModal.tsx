import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { clearReauthError } from '@/core/auth/reducer'
import { selectReauthStatus } from '@/core/auth/selectors/selectReauthStatus'
import { reauthenticate } from '@/core/auth/usecases/reauthenticate.usecase'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'

type ReauthenticationModalProps = Readonly<{
  isVisible: boolean
  onRequestClose: () => void
  onSuccess: () => void
}>

export function ReauthenticationModal({
  isVisible,
  onRequestClose,
  onSuccess,
}: ReauthenticationModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { isReauthenticating, reauthError } = useSelector(selectReauthStatus)
  const [password, setPassword] = useState('')

  const handleConfirm = async () => {
    const result = await dispatch(reauthenticate({ password }))
    if (reauthenticate.fulfilled.match(result)) {
      setPassword('')
      onSuccess()
    }
  }

  const handleClose = () => {
    setPassword('')
    dispatch(clearReauthError())
    onRequestClose()
  }

  return (
    <TiedSModal isVisible={isVisible} onRequestClose={handleClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Confirm your identity</Text>
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
        {reauthError && <Text style={styles.error}>{reauthError}</Text>}
        <View style={styles.buttonContainer}>
          <TiedSButton
            style={styles.cancelButton}
            onPress={handleClose}
            text="Cancel"
          />
          <TiedSButton
            onPress={handleConfirm}
            text="Confirm"
            isDisabled={isReauthenticating || password.length === 0}
          />
        </View>
      </View>
    </TiedSModal>
  )
}

const styles = StyleSheet.create({
  container: {
    width: T.layout.width.full,
    padding: T.spacing.medium,
  },
  title: {
    color: T.color.text,
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
  description: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    textAlign: 'center',
    marginBottom: T.spacing.medium,
  },
  error: {
    color: T.color.red,
    fontSize: T.font.size.small,
    textAlign: 'center',
    marginTop: T.spacing.small,
  },
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
