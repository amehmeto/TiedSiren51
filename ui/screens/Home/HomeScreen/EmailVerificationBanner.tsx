import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, Text } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { sendVerificationEmail } from '@/core/auth/usecases/send-verification-email.usecase'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'
import { selectEmailVerificationBannerViewModel } from './email-verification-banner.view-model'
import { OpenEmailAppButton } from './OpenEmailAppButton'

export function EmailVerificationBanner() {
  const viewModel = useSelector(selectEmailVerificationBannerViewModel)
  const dispatch = useDispatch<AppDispatch>()

  if (!viewModel.visible) return null

  return (
    <TiedSCard style={styles.container}>
      <MaterialCommunityIcons
        name="email-alert"
        size={T.icon.size.large}
        color={T.color.lightBlue}
      />
      <Text style={styles.title}>{viewModel.title}</Text>
      <Text style={styles.description}>{viewModel.description}</Text>
      <OpenEmailAppButton
        email={viewModel.userEmail}
        label={viewModel.openEmailLabel}
      />
      <TiedSButton
        text={viewModel.resendVerificationEmailLabel}
        onPress={() => dispatch(sendVerificationEmail())}
        isDisabled={viewModel.isSendingVerificationEmail}
        style={styles.button}
      />
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
})
