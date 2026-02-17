import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import { T } from '@/ui/design-system/theme'

type ResetPasswordConfirmSuccessViewProps = {
  onBackToLogin: () => void
}

export function ResetPasswordConfirmSuccessView({
  onBackToLogin,
}: ResetPasswordConfirmSuccessViewProps) {
  return (
    <View style={styles.mainContainer}>
      <TiedSCloseButton onClose={onBackToLogin} />
      <View style={styles.container}>
        <Text style={styles.title}>{'PASSWORD RESET'}</Text>
        <Text style={styles.messageText}>
          {'Your password has been reset successfully.'}
        </Text>
        <TiedSButton
          onPress={onBackToLogin}
          text={'BACK TO LOGIN'}
          style={styles.button}
        />
      </View>
    </View>
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
  messageText: {
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
