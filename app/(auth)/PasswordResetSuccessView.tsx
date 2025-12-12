import React from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import { T } from '@/ui/design-system/theme'

export function PasswordResetSuccessView({
  onClose,
  onBackToLogin,
}: {
  onClose: () => void
  onBackToLogin: () => void
}) {
  return (
    <Pressable onPress={Keyboard.dismiss} style={styles.mainContainer}>
      <TiedSCloseButton onClose={onClose} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>{'CHECK YOUR EMAIL'}</Text>
        <Text style={styles.successText}>
          {"We've sent a password reset link to your email address."}
        </Text>
        <TiedSButton
          onPress={onBackToLogin}
          text={'BACK TO LOGIN'}
          style={styles.button}
        />
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
  title: {
    color: T.color.text,
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    marginBottom: T.spacing.medium,
  },
  successText: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    textAlign: 'center',
    marginBottom: T.spacing.large,
  },
  button: {
    paddingVertical: T.spacing.small,
    paddingHorizontal: T.spacing.xx_large,
    marginBottom: T.spacing.x_large,
  },
})
