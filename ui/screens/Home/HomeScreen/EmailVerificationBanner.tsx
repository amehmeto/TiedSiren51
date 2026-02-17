import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { refreshEmailVerificationStatus } from '@/core/auth/usecases/refresh-email-verification-status.usecase'
import { sendVerificationEmail } from '@/core/auth/usecases/send-verification-email.usecase'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'
import {
  EmailVerificationBannerViewModel,
  EmailVerificationBannerViewState,
  selectEmailVerificationBannerViewModel,
} from './email-verification-banner.view-model'

export function EmailVerificationBanner() {
  const dispatch = useDispatch<AppDispatch>()
  const viewModel = useSelector<RootState, EmailVerificationBannerViewModel>(
    selectEmailVerificationBannerViewModel,
  )

  if (viewModel.type === EmailVerificationBannerViewState.Hidden) return null

  return (
    <TiedSCard style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="email-alert"
          size={T.largeIconSize}
          color={T.color.lightBlue}
        />
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.description}>
          Please check your inbox and verify your email address to secure your
          account.
        </Text>
        {viewModel.isVerificationEmailSent && (
          <Text style={styles.sentConfirmation}>
            Verification email sent! Check your inbox.
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {viewModel.isSendingVerificationEmail ? (
          <ActivityIndicator color={T.color.lightBlue} />
        ) : (
          <TiedSButton
            onPress={() => dispatch(sendVerificationEmail())}
            text={viewModel.resendButtonText}
          />
        )}
        <View style={styles.refreshButton}>
          {viewModel.isRefreshingEmailVerification ? (
            <ActivityIndicator color={T.color.lightBlue} />
          ) : (
            <TiedSButton
              onPress={() => dispatch(refreshEmailVerificationStatus())}
              text={viewModel.refreshButtonText}
            />
          )}
        </View>
      </View>
    </TiedSCard>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingVertical: T.spacing.large,
  },
  content: {
    marginBottom: T.spacing.medium,
  },
  title: {
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.bold,
    color: T.color.text,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
  description: {
    fontSize: T.font.size.small,
    color: T.color.text,
    textAlign: 'center',
    lineHeight: T.font.size.medium,
    opacity: T.opacity.semiTransparent,
  },
  sentConfirmation: {
    fontSize: T.font.size.small,
    color: T.color.lightBlue,
    textAlign: 'center',
    marginTop: T.spacing.small,
  },
  buttonContainer: {
    width: T.layout.width.full,
  },
  refreshButton: {
    marginTop: T.spacing.small,
  },
})
