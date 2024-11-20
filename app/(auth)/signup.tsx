import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { T } from '@/ui/design-system/theme'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import TiedSSocialButton from '@/ui/design-system/components/shared/TiedSSocialButton'

export default function SignUpScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <TiedSCloseButton
        onClose={() => router.back()}
        iconColor={T.color.white}
      />
      <Text style={styles.subtitle}>{'GET STARTED FOR FREE'}</Text>
      <TiedSSocialButton
        iconName="logo-google"
        text="CONTINUE WITH GOOGLE"
        // eslint-disable-next-line no-console
        onPress={() => console.log('Continue with Google')}
      />
      <TiedSSocialButton
        iconName="logo-apple"
        text="CONTINUE WITH APPLE"
        // eslint-disable-next-line no-console
        onPress={() => console.log('Continue with Apple')}
      />
      <Text style={styles.orText}>{'OR'}</Text>
      <TiedSTextInput
        placeholder={'Your Email'}
        placeholderTextColor={T.color.grey}
      />
      <TiedSTextInput
        placeholder="Create Password"
        placeholderTextColor={T.color.grey}
        hasPasswordToggle={true}
      />
      <TiedSButton
        onPress={() => router.push('/(auth)/login')}
        text={'CREATE YOUR ACCOUNT'}
      />
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
})
