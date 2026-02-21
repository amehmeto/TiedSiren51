import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, Text } from 'react-native'
import { useSelector } from 'react-redux'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'
import {
  EmailVerificationBannerViewState,
  selectEmailVerificationBannerViewModel,
} from './email-verification-banner.view-model'

export function EmailVerificationBanner() {
  const viewState = useSelector(selectEmailVerificationBannerViewModel)

  if (viewState === EmailVerificationBannerViewState.Hidden) return null

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
})
