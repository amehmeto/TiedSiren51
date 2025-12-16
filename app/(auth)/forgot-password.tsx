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
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { clearAuthState, clearError, setError } from '@/core/auth/reducer'
import { resetPassword } from '@/core/auth/usecases/reset-password.usecase'
import { validateForgotPasswordInput } from '@/ui/auth-schemas/validation-helper'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'
import { FormError } from '@/ui/screens/Home/shared/FormError'
import { PasswordResetSuccessView } from './password-reset-success-view'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [email, setEmail] = useState('')

  const { isLoading, error, isPasswordResetSent } = useSelector(
    (state: RootState) => state.auth,
  )

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

    const validation = validateForgotPasswordInput({ email })

    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(', ')
      dispatch(setError(errorMessage))
      return
    }

    await dispatch(resetPassword({ email }))
  }

  const handleBackToLogin = () => {
    dispatch(clearAuthState())
    router.replace('/(auth)/login')
  }

  if (isPasswordResetSent) {
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
          placeholderTextColor={T.color.grey}
          value={email}
          onChangeText={(text) => {
            setEmail(text)
            if (error) dispatch(clearError())
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TiedSButton
          onPress={handleResetPassword}
          text={isLoading ? 'SENDING...' : 'SEND RESET LINK'}
          style={styles.button}
          disabled={isLoading}
        />
        {error && <FormError error={error} />}
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
})
