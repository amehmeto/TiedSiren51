import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSButtonVariant } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import { TiedSTextLink } from '@/ui/design-system/components/shared/TiedSTextLink'
import { T } from '@/ui/design-system/theme'
import {
  ForgotPasswordViewState,
  selectForgotPasswordViewModel,
} from './forgot-password.view-model'

interface PasswordResetSuccessViewProps {
  onClose: () => void
  onBackToLogin: () => void
  onResend: () => void
}

export function PasswordResetSuccessView({
  onClose,
  onBackToLogin,
  onResend,
}: PasswordResetSuccessViewProps) {
  const [now, setNow] = useState(() => Date.now())

  const viewModel = useSelector((state: RootState) =>
    selectForgotPasswordViewModel(state, now),
  )

  const isResendDisabled =
    viewModel.type === ForgotPasswordViewState.Success
      ? viewModel.isResendDisabled
      : false
  const resendButtonText =
    viewModel.type === ForgotPasswordViewState.Success
      ? viewModel.resendButtonText
      : 'RESEND EMAIL'

  useEffect(() => {
    if (!isResendDisabled) return
    const timer = setTimeout(() => setNow(Date.now()), 1000)
    return () => clearTimeout(timer)
  }, [isResendDisabled, now])

  return (
    <View style={styles.mainContainer}>
      <TiedSCloseButton onClose={onClose} />
      <View style={styles.container}>
        <Text style={styles.title}>{'CHECK YOUR EMAIL'}</Text>
        <Text style={styles.messageText}>
          {"We've sent a password reset link to your email address."}
        </Text>
        <View style={styles.actionsRow}>
          <TiedSTextLink text={'Back to Login'} onPress={onBackToLogin} />
          <TiedSButton
            onPress={onResend}
            text={resendButtonText}
            style={styles.resendButton}
            isDisabled={isResendDisabled}
            variant={TiedSButtonVariant.Secondary}
          />
        </View>
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
    fontFamily: T.font.family.heading,
    marginBottom: T.spacing.medium,
  },
  messageText: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
    marginBottom: T.spacing.large,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.large,
  },
  resendButton: {
    paddingVertical: T.spacing.small,
    paddingHorizontal: T.spacing.xx_large,
  },
})
