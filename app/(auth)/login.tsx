import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { T } from '@/ui/design-system/theme'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'

export default function LoginScreen() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <TiedSLinearBackground>
      <View style={styles.container}>
        <TiedSButton
          style={styles.crossButton}
          onPress={() => router.back()}
          text={
            <Ionicons name="close" size={T.size.large} color={T.color.white} />
          }
        />
        <Text style={styles.subtitle}>{'LOG INTO YOUR ACCOUNT'}</Text>
        <TiedSButton
          style={styles.socialButton}
          onPress={() => console.log('Continue with Google')}
          text={
            <>
              <Ionicons
                name="logo-google"
                size={T.size.large}
                color={T.color.white}
              />
              <Text style={styles.socialButtonText}>
                {'CONTINUE WITH GOOGLE'}
              </Text>
            </>
          }
        />
        <TiedSButton
          style={styles.socialButton}
          onPress={() => console.log('Continue with Apple')}
          text={
            <>
              <Ionicons
                name="logo-apple"
                size={T.size.large}
                color={T.color.white}
              />
              <Text style={styles.socialButtonText}>
                {'CONTINUE WITH APPLE'}
              </Text>
            </>
          }
        />

        <Text style={styles.orText}>{'OR'}</Text>
        <TiedSTextInput
          placeholder={'Your Email'}
          placeholderTextColor={T.color.grey}
        />
        <TiedSTextInput
          placeholder="Create Password"
          placeholderTextColor={T.color.grey}
          secureTextEntry={!showPassword}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={T.size.large}
                color={T.color.grey}
              />
            </TouchableOpacity>
          }
        />
        <TiedSButton
          onPress={() => router.replace('/home')}
          text={'LOG IN'}
          style={styles.button}
        />
        <Text
          style={styles.subtext}
          onPress={() => router.push('/(auth)/forgot-password')}
        >
          {'Forgot your password?'}
        </Text>
      </View>
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
})
