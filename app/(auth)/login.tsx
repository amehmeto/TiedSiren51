import React, { useEffect } from 'react'
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
import { prepareForAuthentication } from '@/core/auth/reducer'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SignInInput, signInSchema } from '@/ui/auth-schemas/auth-schemas'

export default function LoginScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    clearErrors,
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const isUserAuthenticated = useSelector((state: RootState) =>
    selectIsUserAuthenticated(state),
  )

  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isUserAuthenticated) router.push('/')
  }, [isUserAuthenticated, router])

  useEffect(() => {
    dispatch(prepareForAuthentication())
  }, [dispatch])

  const handleClose = () => {
    dispatch(prepareForAuthentication())
    if (router.canGoBack()) {
      router.back()
      return
    }

    if (Platform.OS === 'ios') {
      router.replace('/(auth)/login')
    }
  }

  const onSubmit = async (data: SignInInput) => {
    await dispatch(signInWithEmail(data))
  }

  const handleSocialSignIn = (provider: 'google' | 'apple') => {
    dispatch(prepareForAuthentication())

    const providerActions = {
      google: signInWithGoogle,
      apple: signInWithApple,
    }

    dispatch(providerActions[provider]())
  }

  const clearErrorsOnChange = () => {
    if (error) {
      dispatch(prepareForAuthentication())
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
          onPress={() => handleSocialSignIn('google')}
        />
        <TiedSSocialButton
          iconName="logo-apple"
          text="CONTINUE WITH APPLE"
          onPress={() => handleSocialSignIn('apple')}
        />
        <Text style={styles.orText}>{'OR'}</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TiedSTextInput
              placeholder="Your Email"
              accessibilityLabel="Email"
              placeholderTextColor={T.color.grey}
              value={value}
              onChangeText={(text) => {
                onChange(text)
                clearErrorsOnChange()
                if (errors.email) {
                  clearErrors('email')
                }
              }}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
          )}
        />
        {errors.email && (
          <Text style={styles.fieldErrorText}>{errors.email.message}</Text>
        )}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TiedSTextInput
              placeholder="Enter Your Password"
              accessibilityLabel="Password"
              placeholderTextColor={T.color.grey}
              value={value}
              hasPasswordToggle={true}
              onChangeText={(text) => {
                onChange(text)
                clearErrorsOnChange()
                if (errors.password) {
                  clearErrors('password')
                }
              }}
              onBlur={onBlur}
              textContentType="password"
              autoComplete="current-password"
            />
          )}
        />
        {errors.password && (
          <Text style={styles.fieldErrorText}>{errors.password.message}</Text>
        )}
        <TiedSButton
          onPress={handleSubmit(onSubmit)}
          text={isLoading ? 'LOGGING IN...' : 'LOG IN'}
          style={styles.button}
          disabled={isLoading || !isValid}
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
