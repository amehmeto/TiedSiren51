import * as Linking from 'expo-linking'
import { Platform, StyleSheet } from 'react-native'
import {
  TiedSButton,
  TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { T } from '@/ui/design-system/theme'
import {
  getEmailProvider,
  getOpenEmailLabel,
  getWebUrl,
} from './email-provider'

interface OpenEmailAppButtonProps {
  email: string
}

export function OpenEmailAppButton({ email }: OpenEmailAppButtonProps) {
  const label = getOpenEmailLabel(email)

  const handleOpenEmail = async () => {
    const provider = getEmailProvider(email)

    if (provider) {
      const deepLink =
        Platform.OS === 'ios' ? provider.iosDeepLink : provider.androidDeepLink
      const canOpen = await Linking.canOpenURL(deepLink)
      if (canOpen) {
        await Linking.openURL(deepLink)
        return
      }
    }

    const webUrl = getWebUrl(email)
    if (webUrl) await Linking.openURL(webUrl)
  }

  return (
    <TiedSButton
      text={label}
      onPress={handleOpenEmail}
      variant={TiedSButtonVariant.Secondary}
      style={styles.button}
    />
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: T.spacing.small,
  },
})
