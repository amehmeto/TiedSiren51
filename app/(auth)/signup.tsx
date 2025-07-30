import React, { useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native'
import { useRouter } from 'expo-router'
import { T } from '@/ui/design-system/theme'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import TiedSSocialButton from '@/ui/design-system/components/shared/TiedSSocialButton'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { useDispatch, useSelector } from 'react-redux'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signUpWithEmail } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { clearAuthError } from '@/core/auth/reducer'
import { signUpSchema } from '@/core/auth/validation/auth-schemas'

export default function SignUpScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const handleClose = () => {
    dispatch(clearAuthError())
    if (router.canGoBack()) {
      router.back()
      return
    }

    if (Platform.OS === 'ios') {
      router.replace('/(auth)/login')
    }
  }

  const handleSignUp = async () => {
    // Clear previous errors
    dispatch(clearAuthError())
    setValidationErrors({})

    // Client-side validation
    const validation = signUpSchema.safeParse(credentials)
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message
        }
      })
      setValidationErrors(fieldErrors)
      return
    }

    // Dispatch auth action with better naming
    const authenticationAttempt = await dispatch(
      signUpWithEmail(validation.data),
    )

    // Handle success (redirect will happen via auth state change)
    if (signUpWithEmail.fulfilled.match(authenticationAttempt)) {
      // Success handled by auth state listener
    }
  }

  const handleEmailChange = (text: string) => {
    setCredentials((prev) => ({ ...prev, email: text }))
    // Clear field error when user starts typing
    if (validationErrors.email) {
      setValidationErrors((prev) => ({ ...prev, email: '' }))
    }
  }

  const handlePasswordChange = (text: string) => {
    setCredentials((prev) => ({ ...prev, password: text }))
    if (validationErrors.password) {
      setValidationErrors((prev) => ({ ...prev, password: '' }))
    }
  }

  return (
    <TiedSLinearBackground>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TiedSCloseButton onClose={handleClose} iconColor={T.color.white} />
          <Text style={styles.subtitle}>{'GET STARTED FOR FREE'}</Text>
          <TiedSSocialButton
            iconName="logo-google"
            text="CONTINUE WITH GOOGLE"
            onPress={() => dispatch(signInWithGoogle())}
          />
          <TiedSSocialButton
            iconName="logo-apple"
            text="CONTINUE WITH APPLE"
            onPress={() => dispatch(signInWithApple())}
          />
          <Text style={styles.orText}>{'OR'}</Text>
          <TiedSTextInput
            placeholder="Your Email"
            placeholderTextColor={T.color.grey}
            value={credentials.email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {validationErrors.email && (
            <Text style={styles.fieldErrorText}>{validationErrors.email}</Text>
          )}

          <TiedSTextInput
            placeholder="Create Password"
            placeholderTextColor={T.color.grey}
            hasPasswordToggle={true}
            value={credentials.password}
            onChangeText={handlePasswordChange}
            secureTextEntry={true}
          />
          {validationErrors.password && (
            <Text style={styles.fieldErrorText}>
              {validationErrors.password}
            </Text>
          )}
          <TiedSButton
            onPress={handleSignUp}
            text={isLoading ? 'CREATING ACCOUNT...' : 'CREATE YOUR ACCOUNT'}
            disabled={isLoading}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </TiedSLinearBackground>
  )
}

const styles = StyleSheet.create({
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
