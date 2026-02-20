import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { changePasswordSchema } from '@/ui/auth-schemas/auth.schema'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'

type ChangePasswordFormFields = {
  isChangingPassword: boolean
  changePasswordError: string | null
  hasChangePasswordSucceeded: boolean
  buttonText: string
  onChangePassword: (newPassword: string) => void
}

type ChangePasswordFormProps = Readonly<ChangePasswordFormFields>

type PasswordValidationFailure = { isValid: false; error: string }

type PasswordValidationSuccess = { isValid: true; newPassword: string }

type PasswordValidation = PasswordValidationFailure | PasswordValidationSuccess

// Field clearing on success is handled by the parent remounting via key prop
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
  }

  const displayError = localError ?? changePasswordError

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Change Password</Text>
      <Text style={styles.instruction}>Enter your new password below.</Text>
      <TiedSTextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New password"
        accessibilityLabel="New password"
        placeholderTextColor={T.color.textMuted}
        hasPasswordToggle
        autoCapitalize="none"
      />
      <TiedSTextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        accessibilityLabel="Confirm new password"
        placeholderTextColor={T.color.textMuted}
        hasPasswordToggle
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
    fontFamily: T.font.family.heading,
    marginBottom: T.spacing.medium,
  },
  instruction: {
    color: T.color.text,
    fontSize: T.font.size.base,
    fontFamily: T.font.family.primary,
    marginBottom: T.spacing.medium,
    textAlign: 'center',
  },

  error: {
    color: T.color.red,
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
  success: {
    color: T.color.lightBlue,
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
})
