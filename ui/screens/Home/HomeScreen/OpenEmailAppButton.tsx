import * as Linking from 'expo-linking'
import { StyleSheet } from 'react-native'
import {
  getEmailProvider,
  getOpenEmailLabel,
  getWebUrl,
} from '@/core/auth/email-provider'
import { dependencies } from '@/ui/dependencies'
import {
  TiedSButton,
  TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { T } from '@/ui/design-system/theme'

interface OpenEmailAppButtonProps {
  email: string
}

async function openEmailApp(email: string): Promise<void> {
  try {
    const provider = getEmailProvider(email)

    if (provider) {
      const canOpen = await Linking.canOpenURL(provider.deepLink)
      if (canOpen) {
        await Linking.openURL(provider.deepLink)
        return
      }
    }

    const webUrl = getWebUrl(email)
    if (webUrl) {
      await Linking.openURL(webUrl)
      return
    }

    await Linking.openURL(`mailto:${email}`)
  } catch (error) {
    dependencies.logger.error(
      `[OpenEmailAppButton] Failed to open email app: ${error}`,
    )
  }
}

export function OpenEmailAppButton({ email }: OpenEmailAppButtonProps) {
  const label = getOpenEmailLabel(email)

  return (
    <TiedSButton
      text={label}
      onPress={() => openEmailApp(email)}
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
