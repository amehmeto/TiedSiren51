import React, { useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { T } from '@/ui/design-system/theme'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import TiedSSocialButton from '@/ui/design-system/components/shared/TiedSSocialButton'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { useDispatch } from 'react-redux'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { AppDispatch } from '@/core/_redux_/createStore'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signUpWithEmail } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { validateSignUpInput } from '@/core/auth/validators/validateSignUpInput'

export default function SignUpScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }

    if (Platform.OS === 'ios') {
      router.replace('/(auth)/login')
    }
  }

  const handleSignUp = async () => {
    setError(null)
    const validationError = validateSignUpInput(email, password)
    if (validationError) {
      setError(validationError)
      return
    }
    try {
      const resultAction = await dispatch(signUpWithEmail({ email, password }))
      if (signUpWithEmail.rejected.match(resultAction)) {
        setError(resultAction.payload as string)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
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
            placeholder={'Your Email'}
            placeholderTextColor={T.color.grey}
            value={email}
            onChangeText={setEmail}
          />
          <TiedSTextInput
            placeholder="Create Password"
            placeholderTextColor={T.color.grey}
            hasPasswordToggle={true}
            value={password}
            onChangeText={setPassword}
          />
          <TiedSButton onPress={handleSignUp} text={'CREATE YOUR ACCOUNT'} />
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
})
