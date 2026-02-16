import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { changePasswordSchema } from '@/ui/auth-schemas/auth.schema'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { T } from '@/ui/design-system/theme'

type ChangePasswordFormFields = {
  isChangingPassword: boolean
  changePasswordError: string | null
  hasChangePasswordSucceeded: boolean
  buttonText: string
  onChangePassword: (newPassword: string) => Promise<void>
}

type ChangePasswordFormProps = Readonly<ChangePasswordFormFields>

type PasswordValidation =
  | { isValid: false; error: string }
  | { isValid: true; newPassword: string }

export function ChangePasswordForm({
  isChangingPassword,
  changePasswordError,
  hasChangePasswordSucceeded,
  buttonText,
  onChangePassword,
}: ChangePasswordFormProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const validatePasswords = (): PasswordValidation => {
    const validation = changePasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    })

    if (!validation.success) {
      return {
        isValid: false,
        error: validation.error.errors[0].message,
      }
    }

    return { isValid: true, newPassword: validation.data.newPassword }
  }

  const handleSubmit = () => {
    setLocalError(null)
    const passwordValidation = validatePasswords()

    if (!passwordValidation.isValid) {
      setLocalError(passwordValidation.error)
      return
    }

    onChangePassword(passwordValidation.newPassword)
      .then(() => {
        setNewPassword('')
        setConfirmPassword('')
      })
      .catch(() => {
        // Error is handled by Redux state (changePasswordError)
      })
  }

  const displayError = localError ?? changePasswordError

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Change Password</Text>
      <Text style={styles.instruction}>Enter your new password below.</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New password"
        placeholderTextColor={T.color.grey}
        secureTextEntry
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        placeholderTextColor={T.color.grey}
        secureTextEntry
        autoCapitalize="none"
      />
      {displayError && <Text style={styles.error}>{displayError}</Text>}
      {hasChangePasswordSucceeded && (
        <Text style={styles.success}>Password changed successfully!</Text>
      )}
      <TiedSButton
        onPress={handleSubmit}
        text={buttonText}
        isDisabled={isChangingPassword}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: T.color.text,
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    marginBottom: T.spacing.medium,
  },
  instruction: {
    color: T.color.text,
    fontSize: T.font.size.base,
    marginBottom: T.spacing.medium,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: T.border.width.thin,
    borderColor: T.color.grey,
    borderRadius: T.border.radius.roundedMedium,
    padding: T.spacing.small,
    color: T.color.text,
    fontSize: T.font.size.base,
    marginBottom: T.spacing.medium,
  },
  error: {
    color: T.color.red,
    fontSize: T.font.size.small,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
  success: {
    color: T.color.lightBlue,
    fontSize: T.font.size.small,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
})
