import React, { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  Keyboard,
  Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import { T } from '@/ui/design-system/theme'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import TiedSSocialButton from '@/ui/design-system/components/shared/TiedSSocialButton'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signInWithEmail } from '@/core/auth/usecases/sign-in-with-email.usecase'
import { clearError, clearAuthState, setError } from '@/core/auth/reducer'
import { validateSignInInput } from '@/ui/auth-schemas/validation-helper'
import { useAuthStore } from '@/core/_zustand_/store-context'

export default function LoginScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const authUser = useAuthStore((state) => state.authUser)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)

  useEffect(() => {
    if (authUser) router.push('/')
  }, [authUser, router])

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

  const handleSignIn = async () => {
    dispatch(clearError())

    const validation = validateSignInInput(credentials)

    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(', ')
      dispatch(setError(errorMessage))
      return
    }

    if (validation.data) {
      await dispatch(signInWithEmail(validation.data))
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
          autoFocus
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
        />

        <TiedSButton
          onPress={handleSignIn}
          text={isLoading ? 'LOGGING IN...' : 'LOG IN'}
          style={styles.button}
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
  fieldErrorText: {
    color: T.color.red,
    fontSize: T.font.size.small,
    marginTop: T.spacing.extraSmall,
    alignSelf: 'flex-start',
  },
})
