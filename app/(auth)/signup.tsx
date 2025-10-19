import React, { useState, useEffect } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native'
import { useRouter } from 'expo-router'
import { T } from '@/ui/design-system/theme'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import TiedSSocialButton from '@/ui/design-system/components/shared/TiedSSocialButton'
import { useDispatch, useSelector } from 'react-redux'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signUpWithEmail } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { clearError, clearAuthState, setError } from '@/core/auth/reducer'
import { validateSignUpInput } from '@/ui/auth-schemas/validation-helper'

export default function SignUpScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })

  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(clearAuthState())
  }, [dispatch])

  const handleClose = () => {
    dispatch(clearAuthState())
    if (router.canGoBack()) {
      router.back()
      return
    }

    if (Platform.OS === 'ios') {
      router.replace('/(auth)/login')
    }
  }

  const handleSignUp = async () => {
    dispatch(clearError())

    const validation = validateSignUpInput(credentials)

    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(', ')
      dispatch(setError(errorMessage))
      return
    }

    if (validation.data) {
      await dispatch(signUpWithEmail(validation.data))
    }
  }

  const handleEmailChange = (text: string) => {
    setCredentials((prev) => ({ ...prev, email: text }))

    if (error) {
      dispatch(clearError())
    }
  }

  const handlePasswordChange = (text: string) => {
    setCredentials((prev) => ({ ...prev, password: text }))

    if (error) {
      dispatch(clearError())
    }
  }

  return (
    <Pressable onPress={Keyboard.dismiss} style={styles.mainContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TiedSCloseButton onClose={handleClose} iconColor={T.color.white} />
        <Text style={styles.subtitle}>{'GET STARTED FOR FREE'}</Text>
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
          placeholder="Create Password"
          accessibilityLabel="Password"
          placeholderTextColor={T.color.grey}
          hasPasswordToggle={true}
          value={credentials.password}
          onChangeText={handlePasswordChange}
          textContentType="newPassword"
          autoComplete="new-password"
          autoCapitalize="none"
        />

        <TiedSButton
          onPress={handleSignUp}
          text={isLoading ? 'CREATING ACCOUNT...' : 'CREATE YOUR ACCOUNT'}
          disabled={isLoading}
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
    marginBottom: T.spacing.large,
  },
  orText: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    marginVertical: T.spacing.medium,
  },
  errorText: {
    color: T.color.red,
    fontSize: T.font.size.regular,
    marginVertical: T.spacing.medium,
  },
  fieldErrorText: {
    color: T.color.red,
    fontSize: T.font.size.small,
    marginTop: T.spacing.extraSmall,
    alignSelf: 'flex-start',
  },
})
