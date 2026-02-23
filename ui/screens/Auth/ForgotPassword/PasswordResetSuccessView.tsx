import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ISODateString } from '@/core/_ports_/date-provider'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSButtonVariant } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCloseButton } from '@/ui/design-system/components/shared/TiedSCloseButton'
import { T } from '@/ui/design-system/theme'

const RESEND_COOLDOWN_SECONDS = 60

interface PasswordResetSuccessViewProps {
  onClose: () => void
  onBackToLogin: () => void
  onResend: () => void
  lastPasswordResetRequestAt: ISODateString | null
}

function resendCooldownSecondsRemaining(
  lastRequestAt: ISODateString | null,
): number {
  if (!lastRequestAt) return 0
  const elapsedMs = Date.now() - new Date(lastRequestAt).getTime()
  const remaining = RESEND_COOLDOWN_SECONDS - Math.floor(elapsedMs / 1000)
  return Math.max(0, remaining)
}

export function PasswordResetSuccessView({
  onClose,
  onBackToLogin,
  onResend,
  lastPasswordResetRequestAt,
}: PasswordResetSuccessViewProps) {
  const [tick, setTick] = useState(0)

  const remainingSeconds = resendCooldownSecondsRemaining(
    lastPasswordResetRequestAt,
  )
  const isResendDisabled = remainingSeconds > 0

  useEffect(() => {
    if (!isResendDisabled) return
    const timer = setTimeout(() => setTick((t) => t + 1), 1000)
    return () => clearTimeout(timer)
  }, [isResendDisabled, tick])

  const handleResend = useCallback(() => {
    if (isResendDisabled) return
    onResend()
  }, [isResendDisabled, onResend])

  const resendButtonText = isResendDisabled
    ? `RESEND EMAIL (${remainingSeconds}s)`
    : 'RESEND EMAIL'

  return (
    <View style={styles.mainContainer}>
      <TiedSCloseButton onClose={onClose} />
      <View style={styles.container}>
        <Text style={styles.title}>{'CHECK YOUR EMAIL'}</Text>
        <Text style={styles.messageText}>
          {"We've sent a password reset link to your email address."}
        </Text>
        <TiedSButton
          onPress={onBackToLogin}
          text={'BACK TO LOGIN'}
          style={styles.button}
        />
        <TiedSButton
          onPress={handleResend}
          text={resendButtonText}
          style={styles.resendButton}
          isDisabled={isResendDisabled}
          variant={TiedSButtonVariant.Secondary}
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
  button: {
    paddingVertical: T.spacing.small,
    paddingHorizontal: T.spacing.xx_large,
    marginBottom: T.spacing.x_large,
  },
  resendButton: {
    paddingVertical: T.spacing.small,
    paddingHorizontal: T.spacing.xx_large,
  },
})
