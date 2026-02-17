import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
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
import {
  clearConfirmPasswordResetError,
  clearConfirmPasswordResetState,
} from '@/core/auth/reducer'
import { confirmPasswordReset } from '@/core/auth/usecases/confirm-password-reset.usecase'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'
import {
  ResetPasswordConfirmViewState,
  selectResetPasswordConfirmViewModel,
} from '@/ui/screens/Auth/ResetPasswordConfirm/reset-password-confirm.view-model'
import { ResetPasswordConfirmSuccessView } from '@/ui/screens/Auth/ResetPasswordConfirm/ResetPasswordConfirmSuccessView'
import { FormError } from '@/ui/screens/Home/shared/FormError'

export default function ResetPasswordConfirmScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { oobCode } = useLocalSearchParams<{ oobCode: string }>()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const viewModel = useSelector(selectResetPasswordConfirmViewModel)

  useEffect(() => {
    dispatch(clearConfirmPasswordResetState())
  }, [dispatch])

  const handleClose = () => {
    dispatch(clearConfirmPasswordResetState())
    router.replace('/(auth)/login')
  }

  const handleResetPassword = async () => {
    setLocalError(null)
    dispatch(clearConfirmPasswordResetError())

    if (!oobCode) {
      setLocalError('Invalid password reset link.')
      return
    }

    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    const payload = { oobCode, newPassword }
    await dispatch(confirmPasswordReset(payload))
  }

  const handleBackToLogin = () => {
    dispatch(clearConfirmPasswordResetState())
    router.replace('/(auth)/login')
  }

  const handleRequestNewLink = () => {
    dispatch(clearConfirmPasswordResetState())
    router.replace('/(auth)/forgot-password')
  }

  if (viewModel.type === ResetPasswordConfirmViewState.Success)
    return <ResetPasswordConfirmSuccessView onBackToLogin={handleBackToLogin} />

  const displayError = localError ?? viewModel.error

  return (
    <Pressable onPress={Keyboard.dismiss} style={styles.mainContainer}>
      <TiedSCloseButton onClose={handleClose} />
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
          <Text style={styles.linkText} onPress={handleRequestNewLink}>
            {'Request a new reset link'}
          </Text>
        )}
        <Text style={styles.backText} onPress={handleBackToLogin}>
          {'Back to Login'}
        </Text>
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
    marginBottom: T.spacing.medium,
  },
  subtitle: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    textAlign: 'center',
    marginBottom: T.spacing.large,
  },
  button: {
    paddingVertical: T.spacing.small,
    paddingHorizontal: T.spacing.xx_large,
    marginBottom: T.spacing.x_large,
  },
  backText: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    marginBottom: T.spacing.large,
  },
  linkText: {
    color: T.color.lightBlue,
    fontSize: T.font.size.regular,
    marginBottom: T.spacing.medium,
  },
})
