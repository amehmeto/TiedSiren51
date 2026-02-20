import { useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { clearConfirmPasswordResetError } from '@/core/auth/reducer'
import { confirmPasswordReset } from '@/core/auth/usecases/confirm-password-reset.usecase'
import { changePasswordSchema } from '@/ui/auth-schemas/auth.schema'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import {
  TiedSTextLink,
  TiedSTextLinkVariant,
} from '@/ui/design-system/components/shared/TiedSTextLink'
import { T } from '@/ui/design-system/theme'
import {
  ResetPasswordConfirmViewState,
  selectResetPasswordConfirmViewModel,
} from '@/ui/screens/Auth/ResetPasswordConfirm/reset-password-confirm.view-model'
import { FormError } from '@/ui/screens/Home/shared/FormError'

type ResetPasswordConfirmFormProps = {
  onBackToLogin: () => void
  onRequestNewLink: () => void
}

export function ResetPasswordConfirmForm({
  onBackToLogin,
  onRequestNewLink,
}: ResetPasswordConfirmFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { oobCode } = useLocalSearchParams<{ oobCode?: string }>()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const viewModel = useSelector(selectResetPasswordConfirmViewModel)

  if (viewModel.type === ResetPasswordConfirmViewState.Success) return null

  const handleResetPassword = async () => {
    setLocalError(null)
    dispatch(clearConfirmPasswordResetError())

    if (!oobCode) {
      setLocalError('Invalid password reset link.')
      return
    }

    const validation = changePasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    })

    if (!validation.success) {
      setLocalError(validation.error.errors[0].message)
      return
    }

    const payload = { oobCode, newPassword: validation.data.newPassword }
    await dispatch(confirmPasswordReset(payload))
  }

  const displayError = localError ?? viewModel.error

  return (
    <Pressable onPress={Keyboard.dismiss} style={styles.mainContainer}>
      <TiedSCloseButton onClose={onBackToLogin} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>{'SET NEW PASSWORD'}</Text>
        <Text style={styles.subtitle}>{'Enter your new password below.'}</Text>
        <TiedSTextInput
          placeholder="New Password"
          accessibilityLabel="New Password"
          placeholderTextColor={T.color.grey}
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text)
            if (localError) setLocalError(null)
            if (viewModel.error) dispatch(clearConfirmPasswordResetError())
          }}
          secureTextEntry
          editable={!viewModel.isInputDisabled}
        />
        <TiedSTextInput
          placeholder="Confirm Password"
          accessibilityLabel="Confirm Password"
          placeholderTextColor={T.color.grey}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text)
            if (localError) setLocalError(null)
            if (viewModel.error) dispatch(clearConfirmPasswordResetError())
          }}
          secureTextEntry
          editable={!viewModel.isInputDisabled}
        />
        <TiedSButton
          onPress={handleResetPassword}
          text={viewModel.buttonText}
          style={styles.button}
          isDisabled={viewModel.isInputDisabled}
        />
        {displayError && <FormError error={displayError} />}
        {viewModel.error && (
          <TiedSTextLink
            text="Request a new reset link"
            onPress={onRequestNewLink}
            variant={TiedSTextLinkVariant.Highlight}
            style={styles.linkSpacing}
          />
        )}
        <TiedSTextLink
          text="Back to Login"
          onPress={onBackToLogin}
          style={styles.backSpacing}
        />
      </KeyboardAvoidingView>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: T.spacing.large,
  },
  title: {
    color: T.color.text,
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.heading,
    marginBottom: T.spacing.medium,
  },
  subtitle: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
    marginBottom: T.spacing.large,
  },
  button: {
    paddingVertical: T.spacing.small,
    paddingHorizontal: T.spacing.xx_large,
    marginBottom: T.spacing.x_large,
  },
  backSpacing: {
    marginBottom: T.spacing.large,
  },
  linkSpacing: {
    marginBottom: T.spacing.medium,
  },
})
