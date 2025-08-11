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
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectIsUserAuthenticated } from '@/core/auth/selectors/selectIsUserAuthenticated'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signInWithEmail } from '@/core/auth/usecases/sign-in-with-email.usecase'
import { clearError, clearAuthState } from '@/core/auth/reducer'
import { validateSignInInput } from '@/ui/auth-schemas/validation-helper'

export default function LoginScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isUserAuthenticated = useSelector((state: RootState) =>
    selectIsUserAuthenticated(state),
  )

  const { isLoading, error } = useSelector((state: RootState) => state.auth)

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

    if (Platform.OS === 'ios') {
      router.replace('/(auth)/login')
    }
  }

  const handleSignIn = async () => {
    setFieldErrors({})

    const validation = validateSignInInput(credentials)

    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      return
    }

    if (validation.data) {
      await dispatch(signInWithEmail(validation.data))
    }
  }

  const handleEmailChange = (text: string) => {
    setCredentials((prev) => ({ ...prev, email: text }))

    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: '' }))
    }

    if (error) {
      dispatch(clearError())
    }
  }

  const handlePasswordChange = (text: string) => {
    setCredentials((prev) => ({ ...prev, password: text }))

    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: '' }))
    }

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
        {fieldErrors.email && (
          <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
        )}
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
        {fieldErrors.password && (
          <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
        )}
        <TiedSButton
          onPress={handleSignIn}
          text={isLoading ? 'LOGGING IN...' : 'LOG IN'}
          style={styles.button}
          disabled={isLoading || Object.values(fieldErrors).some(Boolean)}
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
