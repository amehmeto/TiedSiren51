import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, Text } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'
import {
  EmailVerificationBannerViewModel,
  EmailVerificationBannerViewState,
  selectEmailVerificationBannerViewModel,
} from './email-verification-banner.view-model'

export function EmailVerificationBanner() {
  const viewModel = useSelector<RootState, EmailVerificationBannerViewModel>(
    selectEmailVerificationBannerViewModel,
  )

  if (viewModel.type === EmailVerificationBannerViewState.Hidden) return null

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
    fontWeight: T.font.weight.bold,
    color: T.color.text,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
  description: {
    fontSize: T.font.size.small,
    color: T.color.text,
    textAlign: 'center',
    opacity: T.opacity.semiTransparent,
  },
})
