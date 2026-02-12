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
import { isAuthErrorType } from '@/core/auth/auth-error-type'
import { clearAuthState, clearError, setError } from '@/core/auth/reducer'
import { selectIsUserAuthenticated } from '@/core/auth/selectors/selectIsUserAuthenticated'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signInWithEmail } from '@/core/auth/usecases/sign-in-with-email.usecase'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { validateSignInInput } from '@/ui/auth-schemas/validation.helper'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import TiedSSocialButton from '@/ui/design-system/components/shared/TiedSSocialButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'
import {
  LoginViewState,
  selectLoginViewModel,
} from '@/ui/screens/Auth/Login/login.view-model'

export default function LoginScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [credentials, setCredentials] = useState({ email: '', password: '' })

  const isUserAuthenticated = useSelector(selectIsUserAuthenticated)

  const viewModel = useSelector(selectLoginViewModel)

  useEffect(() => {
    if (isUserAuthenticated) router.push('/')
  }, [isUserAuthenticated, router])

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

  const handleSignIn = async () => {
    dispatch(clearError())

    const { isValid, errors, data } = validateSignInInput(credentials)

    if (!isValid) {
      const errorMessage = Object.values(errors).join(', ')
      dispatch(setError(errorMessage))
      return
    }

    if (data) {
      const result = await dispatch(signInWithEmail(data))
      if (
        signInWithEmail.rejected.match(result) &&
        isAuthErrorType(result.error.code) &&
        result.error.code === 'CREDENTIAL'
      )
        setCredentials((prev) => ({ ...prev, password: '' }))
    }
  }

  const handleEmailChange = (text: string) => {
    setCredentials((prev) => ({ ...prev, email: text }))

    if (viewModel.type === LoginViewState.Error) dispatch(clearError())
  }

  const handlePasswordChange = (text: string) => {
    setCredentials((prev) => ({ ...prev, password: text }))

    if (viewModel.type === LoginViewState.Error) dispatch(clearError())
  }

  const error =
    viewModel.type === LoginViewState.Error ? viewModel.error : undefined

  return (
    <Pressable onPress={Keyboard.dismiss} style={styles.mainContainer}>
      <TiedSCloseButton onClose={handleClose} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.subtitle}>{'LOG INTO YOUR ACCOUNT'}</Text>
        <TiedSSocialButton
          iconName="logo-google"
          text="CONTINUE WITH GOOGLE"
          onPress={() => {
            dispatch(signInWithGoogle())
          }}
        />
        <TiedSSocialButton
          iconName="logo-apple"
          text="CONTINUE WITH APPLE"
          onPress={() => {
            dispatch(signInWithApple())
          }}
        />
        <Text style={styles.orText}>{'OR'}</Text>
        <TiedSTextInput
          placeholder="Your Email"
          accessibilityLabel="Email"
          placeholderTextColor={T.color.grey}
          value={credentials.email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TiedSTextInput
          placeholder="Enter Your Password"
          accessibilityLabel="Password"
          placeholderTextColor={T.color.grey}
          value={credentials.password}
          hasPasswordToggle={true}
          onChangeText={handlePasswordChange}
          textContentType="password"
          autoComplete="current-password"
          autoCapitalize="none"
        />

        <TiedSButton
          onPress={handleSignIn}
          text={viewModel.buttonText}
          style={styles.button}
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
        <Text
          style={styles.subtext}
          onPress={() => router.push('/(auth)/forgot-password')}
        >
          {'Forgot your password?'}
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
  subtitle: {
    color: T.color.text,
    fontSize: T.font.size.large,
    marginBottom: T.spacing.large,
  },
  orText: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    marginVertical: T.spacing.medium,
  },
  button: {
    paddingVertical: T.spacing.small,
    paddingHorizontal: T.spacing.xx_large,
    marginBottom: T.spacing.x_large,
  },
  subtext: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    marginBottom: T.spacing.large,
  },
  errorText: {
    color: T.color.red,
    fontSize: T.font.size.regular,
    marginBottom: T.spacing.large,
  },
})
