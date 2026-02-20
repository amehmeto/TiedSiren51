import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
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
  clearAuthState,
  clearError,
  setEmail,
  setError,
  setPassword,
} from '@/core/auth/reducer'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { signUpWithEmail } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { FeatureFlags } from '@/feature-flags'
import { validateSignUpInput } from '@/ui/auth-schemas/validation.helper'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import TiedSSocialButton from '@/ui/design-system/components/shared/TiedSSocialButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'
import { selectSignUpViewModel } from '@/ui/screens/Auth/SignUp/sign-up.view-model'

export default function SignUpScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const viewModel = useSelector(selectSignUpViewModel)
  const { error } = viewModel

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

  const handleSignUp = async () => {
    dispatch(clearError())

    const { errorMessage, data: validCredentials } = validateSignUpInput({
      email: viewModel.email,
      password: viewModel.password,
    })

    if (errorMessage) {
      dispatch(setError(errorMessage))
      return
    }

    if (validCredentials) await dispatch(signUpWithEmail(validCredentials))
  }

  return (
    <Pressable onPress={Keyboard.dismiss} style={styles.mainContainer}>
      <TiedSCloseButton onClose={handleClose} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.subtitle}>{'GET STARTED FOR FREE'}</Text>
        <TiedSSocialButton
          iconName="logo-google"
          text="CONTINUE WITH GOOGLE"
          onPress={() => {
            dispatch(signInWithGoogle())
          }}
        />
        {FeatureFlags.APPLE_SIGN_IN && (
          <TiedSSocialButton
            iconName="logo-apple"
            text="CONTINUE WITH APPLE"
            onPress={() => {
              dispatch(signInWithApple())
            }}
          />
        )}
        <Text style={styles.orText}>{'OR'}</Text>
        <TiedSTextInput
          placeholder="Your Email"
          accessibilityLabel="Email"
          placeholderTextColor={T.color.grey}
          value={viewModel.email}
          onChangeText={(text) => {
            dispatch(setEmail(text))
            if (error) dispatch(clearError())
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TiedSTextInput
          placeholder="Create Password"
          accessibilityLabel="Password"
          placeholderTextColor={T.color.grey}
          hasPasswordToggle
          value={viewModel.password}
          onChangeText={(text) => {
            dispatch(setPassword(text))
            if (error) dispatch(clearError())
          }}
          textContentType="newPassword"
          autoComplete="new-password"
          autoCapitalize="none"
        />

        <TiedSButton
          onPress={handleSignUp}
          text={viewModel.buttonText}
          isDisabled={viewModel.isInputDisabled}
        />
        {error && (
          <Text
            style={styles.errorText}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
          >
            {error}
          </Text>
        )}
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
  subtitle: {
    color: T.color.text,
    fontSize: T.font.size.large,
    fontFamily: T.font.family.heading,
    marginBottom: T.spacing.large,
  },
  orText: {
    color: T.color.textMuted,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
    marginVertical: T.spacing.medium,
  },
  errorText: {
    color: T.color.red,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
    marginVertical: T.spacing.medium,
  },
})
