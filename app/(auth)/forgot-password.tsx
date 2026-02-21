import { useRouter } from 'expo-router'
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
import { clearAuthState, clearError, setError } from '@/core/auth/reducer'
import { resetPassword } from '@/core/auth/usecases/reset-password.usecase'
import { getForgotPasswordValidationError } from '@/ui/auth-schemas/validation.helper'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'
import {
  ForgotPasswordViewState,
  selectForgotPasswordViewModel,
} from '@/ui/screens/Auth/ForgotPassword/forgot-password.view-model'
import { PasswordResetSuccessView } from '@/ui/screens/Auth/ForgotPassword/PasswordResetSuccessView'
import { FormError } from '@/ui/screens/Home/shared/FormError'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [email, setEmail] = useState('')

  const viewModel = useSelector(selectForgotPasswordViewModel)

  useEffect(() => {
    dispatch(clearAuthState())
  }, [dispatch])

  const handleClose = () => {
    dispatch(clearAuthState())
    if (router.canGoBack()) {
      router.back()
      return
    }

    if (Platform.OS === 'ios') router.replace('/(auth)/login')
  }

  const handleResetPassword = async () => {
    dispatch(clearError())

    const validationError = getForgotPasswordValidationError(email)
    if (validationError) {
      dispatch(setError(validationError))
      return
    }

    await dispatch(resetPassword({ email }))
  }

  const handleBackToLogin = () => {
    dispatch(clearAuthState())
    router.replace('/(auth)/login')
  }

  if (viewModel.type === ForgotPasswordViewState.Success) {
    return (
      <PasswordResetSuccessView
        onClose={handleClose}
        onBackToLogin={handleBackToLogin}
      />
    )
  }

  return (
    <Pressable onPress={Keyboard.dismiss} style={styles.mainContainer}>
      <TiedSCloseButton onClose={handleClose} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>{'RESET YOUR PASSWORD'}</Text>
        <Text style={styles.subtitle}>
          {
            'Enter your email and we will send you a link to reset your password.'
          }
        </Text>
        <TiedSTextInput
          placeholder="Your Email"
          accessibilityLabel="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text)
            if (viewModel.error) dispatch(clearError())
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!viewModel.isInputDisabled}
        />

        <TiedSButton
          onPress={handleResetPassword}
          text={viewModel.buttonText}
          style={styles.button}
          isDisabled={viewModel.isInputDisabled}
        />
        {viewModel.error && <FormError error={viewModel.error} />}
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
  backText: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.medium,
    marginBottom: T.spacing.large,
  },
})
