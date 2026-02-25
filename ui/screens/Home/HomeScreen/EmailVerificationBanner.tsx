import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, Text } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { clearError } from '@/core/auth/reducer'
import { sendVerificationEmail } from '@/core/auth/usecases/send-verification-email.usecase'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'
import { selectEmailVerificationBannerViewModel } from './email-verification-banner.view-model'

export function EmailVerificationBanner() {
  const viewModel = useSelector(selectEmailVerificationBannerViewModel)
  const dispatch = useDispatch<AppDispatch>()

  if (!viewModel.visible) return null

  const handleResend = () => {
    dispatch(clearError())
    dispatch(sendVerificationEmail())
  }

  return (
    <TiedSCard style={styles.container}>
      <MaterialCommunityIcons
        name="email-alert"
        size={T.icon.size.large}
        color={T.color.lightBlue}
      />
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.description}>
        Check your inbox and tap the verification link.
      </Text>
      <TiedSButton
        text={viewModel.resendVerificationEmailLabel}
        onPress={handleResend}
        isDisabled={viewModel.isSendingVerificationEmail}
        style={styles.button}
      />
      {viewModel.error && (
        <Text style={styles.errorText}>{viewModel.error}</Text>
      )}
    </TiedSCard>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: T.spacing.medium,
  },
  title: {
    fontSize: T.font.size.medium,
    fontFamily: T.font.family.semibold,
    color: T.color.text,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
  description: {
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    color: T.color.textMuted,
    textAlign: 'center',
  },
  button: {
    marginTop: T.spacing.medium,
  },
  errorText: {
    color: T.color.red,
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
    marginTop: T.spacing.small,
  },
})
