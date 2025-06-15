import React, { useEffect, useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
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
import { clearAuthError } from '@/core/auth/reducer'

export default function LoginScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [{ email, password }, setCredentials] = useState<{
    email: string
    password: string
  }>({ email: '', password: '' })
  const errorMessage = useSelector(
    (state: RootState) => state.auth.errorMessage,
  )

  const handleEmailChange = (text: string) => {
    setCredentials((prev) => ({ ...prev, email: text }))
    dispatch(clearAuthError())
  }

  const handlePasswordChange = (text: string) => {
    setCredentials((prev) => ({ ...prev, password: text }))
    dispatch(clearAuthError())
  }

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }

    if (Platform.OS === 'ios') router.replace('/(auth)/login')
  }

  const isUserAuthenticated = useSelector((state: RootState) =>
    selectIsUserAuthenticated(state),
  )

  useEffect(() => {
    if (isUserAuthenticated) router.push('/')
  }, [isUserAuthenticated, router])

  return (
    <View style={styles.container}>
      <TiedSCloseButton onClose={handleClose} iconColor={T.color.white} />
      <Text style={styles.subtitle}>{'LOG INTO YOUR ACCOUNT'}</Text>
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
        onChangeText={handleEmailChange}
      />
      <TiedSTextInput
        placeholder="Create Password"
        placeholderTextColor={T.color.grey}
        value={password}
        hasPasswordToggle={true}
        onChangeText={handlePasswordChange}
      />
      <TiedSButton
        onPress={() => dispatch(signInWithEmail({ email, password }))}
        text={'LOG IN'}
        style={styles.button}
      />
      <Text
        style={styles.subtext}
        onPress={() => router.push('/(auth)/forgot-password')}
      >
        {'Forgot your password?'}
      </Text>
      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: T.spacing.large,
  },
  crossButton: {
    position: 'absolute',
    top: T.spacing.xx_large,
    left: T.spacing.medium,
    backgroundColor: 'transparent',
  },
  subtitle: {
    color: T.color.text,
    fontSize: T.font.size.large,
    marginBottom: T.spacing.large,
  },
  socialButton: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: T.spacing.medium,
    borderRadius: T.border.radius.roundedMedium,
    marginBottom: T.spacing.medium,
    backgroundColor: T.color.modalBackgroundColor,
  },
  socialButtonText: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    fontWeight: T.font.weight.bold,
    marginLeft: T.spacing.medium,
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
  errorMessage: {
    color: T.color.red,
    fontSize: T.font.size.regular,
    marginVertical: T.spacing.medium,
  },
})
